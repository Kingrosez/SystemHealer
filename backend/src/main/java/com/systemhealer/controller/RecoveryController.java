package com.systemhealer.controller;

import com.systemhealer.api.CreateRestorePointRequest;
import com.systemhealer.api.CreateRestorePointResponse;
import com.systemhealer.api.RepairHistoryDetail;
import com.systemhealer.api.RepairHistoryItem;
import com.systemhealer.api.RestorePointResponse;
import com.systemhealer.api.RestoreRequest;
import com.systemhealer.api.RestoreResponse;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.RepairLog;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.RepairLogRepository;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.RecoveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/recovery")
@Validated
public class RecoveryController {

    @Autowired
    private RecoveryService recoveryService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RepairLogRepository logRepository;

    @GetMapping("/history")
    public ResponseEntity<List<RepairHistoryItem>> getHistory() {
        List<Task> tasks = taskRepository.findByTypeOrderByStartedAtDesc(TaskType.RECOVERY);
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

    @GetMapping("/restore-points")
    public ResponseEntity<RestorePointResponse> listRestorePoints() {
        return ResponseEntity.ok(recoveryService.getRestorePoints());
    }

    @PostMapping("/restore-points")
    public ResponseEntity<CreateRestorePointResponse> createRestorePoint(@RequestBody CreateRestorePointRequest request) {
        CreateRestorePointResponse response = recoveryService.createRestorePoint(request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/restore")
    public ResponseEntity<RestoreResponse> restore(@RequestBody @Valid RestoreRequest request) {
        if (!request.isConfirm()) {
            throw new SystemHealerException(
                    "Restore confirmation required",
                    ErrorCodes.VALIDATION_FAILED,
                    HttpStatus.BAD_REQUEST);
        }

        Task task = taskRepository.save(new Task(TaskType.RECOVERY, TaskStatus.PENDING, "System restore to " + request.getPointId()));

        final String taskId = task.getId();
        final String pointId = request.getPointId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(task);
            recoveryService.restore(t, pointId);
        });

        return ResponseEntity.accepted().body(new RestoreResponse(task.getId()));
    }
}