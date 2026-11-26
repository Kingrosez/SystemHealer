package com.systemhealer.controller;

import com.systemhealer.api.RepairHistoryDetail;
import com.systemhealer.api.RepairHistoryItem;
import com.systemhealer.api.RepairHistoryResponse;
import com.systemhealer.api.RepairStartRequest;
import com.systemhealer.api.RepairStartResponse;
import com.systemhealer.api.SSEView;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.RepairLog;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.RepairLogRepository;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.RepairService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/repair")
@Validated
public class RepairController {

    @Autowired
    private RepairService repairService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RepairLogRepository logRepository;

    /**
     * Start a repair run.
     * Returns 202 with taskId and streamUrl immediately.
     * If createRestorePoint is true, creates a restore point first.
     */
    @PostMapping("/start")
    public ResponseEntity<RepairStartResponse> start(
            @RequestBody @Valid RepairStartRequest request,
            @RequestHeader(value = "X-Confirm-Token", required = false) String confirmToken) {

        // Check for restore point token if creating restore point
        if (request.isCreateRestorePoint() && confirmToken == null) {
            String token = generateRestorePointToken();
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new RepairStartResponse(null, "/api/repair/stream/" + null, "restore_point_required", token));
        }

        Task task = taskRepository.save(new Task(TaskType.REPAIR, TaskStatus.PENDING, "Repair scan: " + request.getActions()));

        // Start repair asynchronously
        final String taskId = task.getId();
        final RepairStartRequest asyncRequest = request;
        final Task savedTask = task;
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(savedTask);
            repairService.startRepair(t, asyncRequest);
        });

        String streamUrl = "/api/repair/stream/" + task.getId();
        RepairStartResponse response = new RepairStartResponse(task.getId(), streamUrl, null, null);

        return ResponseEntity.accepted().body(response);
    }

    /**
     * Generate a restore point confirmation token.
     */
    private String generateRestorePointToken() {
        return "rp_" + System.currentTimeMillis();
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

    @PostMapping("/{taskId}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));

        if (task.getStatus() != TaskStatus.RUNNING) {
            throw new SystemHealerException(
                    "Task is not running",
                    ErrorCodes.TASK_ALREADY_RUNNING,
                    HttpStatus.CONFLICT);
        }

        repairService.cancelRepair(taskId);
        task.setStatus(TaskStatus.CANCELLED);
        taskRepository.save(task);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    public ResponseEntity<RepairHistoryResponse> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<Task> tasks = taskRepository.findByTypeOrderByStartedAtDesc(TaskType.REPAIR);
        List<RepairHistoryItem> items = tasks.stream()
                .map(task -> new RepairHistoryItem(
                        task.getId(),
                        task.getStatus().toString(),
                        task.getStartedAt(),
                        task.getErrorMessage()
                ))
                .toList();

        RepairHistoryResponse response = new RepairHistoryResponse();
        response.setItems(items);
        response.setPage(page);
        response.setSize(size);
        response.setTotal(items.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<RepairHistoryDetail> detail(@PathVariable String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new SystemHealerException(
                        "Repair history not found: " + id,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));

        List<RepairLog> logs = logRepository.findByTaskIdOrderByTimestampAsc(id);
        List<String> logLines = logs.stream()
                .map(log -> "[" + log.getTimestamp() + "] " + log.getLevel() + " - " + log.getLine())
                .toList();

        return ResponseEntity.ok(new RepairHistoryDetail(task, logLines));
    }
}