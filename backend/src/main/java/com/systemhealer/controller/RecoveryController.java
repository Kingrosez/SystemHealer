package com.systemhealer.controller;

import com.systemhealer.api.CreateRestorePointRequest;
import com.systemhealer.api.CreateRestorePointResponse;
import com.systemhealer.api.RestorePointResponse;
import com.systemhealer.api.RestoreRequest;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.RecoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/recovery")
public class RecoveryController {

    @Autowired
    private RecoveryService recoveryService;

    @Autowired
    private TaskRepository taskRepository;

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
    public ResponseEntity<RestoreResponse> restore(@RequestBody RestoreRequest request) {
        if (!request.isConfirm()) {
            throw new SystemHealerException(
                    "Restore confirmation required",
                    ErrorCodes.VALIDATION_FAILED,
                    HttpStatus.BAD_REQUEST);
        }

        Task task = new Task(TaskType.RECOVERY, TaskStatus.RUNNING, "System restore to " + request.getPointId());
        Task savedTask = taskRepository.save(task);

        final String taskId = savedTask.getId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(savedTask);
            recoveryService.restore(t, request.getPointId());
        });

        return ResponseEntity.accepted().body(new RestoreResponse(savedTask.getId()));
    }

    public static class RestoreResponse {
        private final String taskId;

        public RestoreResponse(String taskId) {
            this.taskId = taskId;
        }

        public String getTaskId() { return taskId; }
    }
}