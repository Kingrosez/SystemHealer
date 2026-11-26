package com.systemhealer.controller;

import com.systemhealer.api.CleanerExecuteRequest;
import com.systemhealer.api.CleanerExecuteResponse;
import com.systemhealer.api.CleanerPreviewResponse;
import com.systemhealer.api.CleanerScanRequest;
import com.systemhealer.api.CleanerScanResponse;
import com.systemhealer.api.DuplicateExecuteRequest;
import com.systemhealer.api.DuplicateExecuteResponse;
import com.systemhealer.api.DuplicateGroupsResponse;
import com.systemhealer.api.DuplicateScanRequest;
import com.systemhealer.api.DuplicateScanResponse;
import com.systemhealer.api.RepairHistoryDetail;
import com.systemhealer.api.RepairHistoryItem;
import com.systemhealer.api.SSEView;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.RepairLog;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.RepairLogRepository;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.CleanerService;
import com.systemhealer.util.ConfirmationTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/cleaner")
@Validated
public class CleanerController {

    @Autowired
    private CleanerService cleanerService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RepairLogRepository logRepository;

    @Autowired
    private ConfirmationTokenService tokenService;

    @GetMapping("/history")
    public ResponseEntity<List<RepairHistoryItem>> getHistory() {
        List<Task> tasks = taskRepository.findByTypeOrderByStartedAtDesc(TaskType.CLEANER);
        List<RepairHistoryItem> items = tasks.stream()
                .map(task -> new RepairHistoryItem(
                        task.getId(),
                        task.getStatus().toString(),
                        task.getStartedAt(),
                        task.getErrorMessage()
                ))
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/history/{taskId}")
    public ResponseEntity<RepairHistoryDetail> getDetail(@PathVariable String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));

        List<RepairLog> logs = logRepository.findByTaskIdOrderByTimestampAsc(taskId);
        List<String> logLines = logs.stream()
                .map(log -> "[" + log.getTimestamp() + "] " + log.getLevel() + " - " + log.getLine())
                .toList();

        return ResponseEntity.ok(new RepairHistoryDetail(task, logLines));
    }

    @PostMapping("/scan")
    public ResponseEntity<CleanerScanResponse> scan(@RequestBody @Valid CleanerScanRequest request) {
        Task task = taskRepository.save(new Task(TaskType.CLEANER, TaskStatus.PENDING, "Cleaner scan"));

        final String taskId = task.getId();
        final CleanerScanRequest scanRequest = request;
        CompletableFuture.runAsync(() -> {
            cleanerService.startScan(taskRepository.findById(taskId).orElse(task), scanRequest);
        });

        return ResponseEntity.accepted().body(new CleanerScanResponse(task.getId(), "/api/cleaner/stream/" + task.getId()));
    }

    @PostMapping("/preview")
    public ResponseEntity<CleanerPreviewResponse> preview() {
        CleanerPreviewResponse response = cleanerService.getPreview();
        String token = tokenService.generateToken("cleaner-preview-" + UUID.randomUUID());
        response.setConfirmToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/execute")
    public ResponseEntity<CleanerExecuteResponse> execute(@RequestBody @Valid CleanerExecuteRequest request) {
        tokenService.validateToken(request.getConfirmToken())
                .orElseThrow(() -> new SystemHealerException(
                        "Invalid or expired confirmation token",
                        ErrorCodes.INVALID_CONFIRM_TOKEN,
                        HttpStatus.CONFLICT));
        tokenService.consumeToken(request.getConfirmToken());

        CleanerExecuteResponse response = cleanerService.execute(request.getPaths());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/duplicates/scan")
    public ResponseEntity<DuplicateScanResponse> duplicateScan(@RequestBody @Valid DuplicateScanRequest request) {
        Task task = taskRepository.save(new Task(TaskType.DUPLICATE_SCAN, TaskStatus.PENDING, "Duplicate scan"));

        final String taskId = task.getId();
        final DuplicateScanRequest scanRequest = request;
        CompletableFuture.runAsync(() -> {
            cleanerService.startDuplicateScan(taskRepository.findById(taskId).orElse(task), scanRequest);
        });

        return ResponseEntity.accepted().body(new DuplicateScanResponse(task.getId(), "/api/cleaner/duplicates/stream/" + task.getId()));
    }

    @GetMapping("/duplicates/stream/{taskId}")
    public SSEView duplicateStream(@PathVariable @NotBlank(message = "Task ID cannot be empty") String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return new SSEView(taskId);
    }

    @GetMapping("/duplicates/groups")
    public ResponseEntity<DuplicateGroupsResponse> duplicateGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (page < 0 || size <= 0 || size > 1000) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cleanerService.getDuplicateGroups(page, size));
    }

    @PostMapping("/duplicates/execute")
    public ResponseEntity<DuplicateExecuteResponse> duplicateExecute(@RequestBody @Valid DuplicateExecuteRequest request) {
        tokenService.validateToken(request.getConfirmToken())
                .orElseThrow(() -> new SystemHealerException(
                        "Invalid or expired confirmation token",
                        ErrorCodes.INVALID_CONFIRM_TOKEN,
                        HttpStatus.CONFLICT));
        tokenService.consumeToken(request.getConfirmToken());

        DuplicateExecuteResponse response = cleanerService.executeDuplicates(request.getFileIds());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stream/{taskId}")
    public SSEView stream(@PathVariable @NotBlank(message = "Task ID cannot be empty") String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return new SSEView(taskId);
    }
}