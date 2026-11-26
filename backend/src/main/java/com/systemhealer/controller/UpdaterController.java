package com.systemhealer.controller;

import com.systemhealer.api.RepairHistoryDetail;
import com.systemhealer.api.RepairHistoryItem;
import com.systemhealer.api.SSEView;
import com.systemhealer.api.UpdaterExecuteRequest;
import com.systemhealer.api.UpdaterExecuteResponse;
import com.systemhealer.api.UpdaterScanResponse;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.RepairLog;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.RepairLogRepository;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.UpdaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/updater")
@Validated
public class UpdaterController {

    @Autowired
    private UpdaterService updaterService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RepairLogRepository logRepository;

    @GetMapping("/history")
    public ResponseEntity<List<RepairHistoryItem>> getHistory() {
        List<Task> tasks = taskRepository.findByTypeOrderByStartedAtDesc(TaskType.UPDATER);
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

    @GetMapping("/scan")
    public ResponseEntity<UpdaterScanResponse> scan() {
        return ResponseEntity.ok(updaterService.scan());
    }

    @PostMapping("/execute")
    public ResponseEntity<UpdaterExecuteResponse> execute(@RequestBody @Valid UpdaterExecuteRequest request) {
        Task task = taskRepository.save(new Task(TaskType.UPDATER, TaskStatus.PENDING, "Update: " + request.getIds()));

        final String taskId = task.getId();
        final UpdaterExecuteRequest asyncRequest = request;
        final Task savedTask = task;
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(savedTask);
            updaterService.execute(t, asyncRequest.getIds());
        });

        return ResponseEntity.accepted().body(new UpdaterExecuteResponse(task.getId(), "/api/updater/stream/" + task.getId()));
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