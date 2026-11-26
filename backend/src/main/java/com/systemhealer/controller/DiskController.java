package com.systemhealer.controller;

import com.systemhealer.api.DiskScanRequest;
import com.systemhealer.api.DiskScanResponse;
import com.systemhealer.api.DiskUsageResponse;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.DiskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/disk")
public class DiskController {

    @Autowired
    private DiskService diskService;

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/usage")
    public ResponseEntity<DiskUsageResponse> usage() {
        return ResponseEntity.ok(diskService.getDiskUsage());
    }

    @PostMapping("/scan")
    public ResponseEntity<DiskScanResponse> scan(@RequestBody(required = false) DiskScanRequest request) {
        if (request == null || request.getDrive() == null || request.getDrive().isBlank()) {
            throw new SystemHealerException(
                    "Drive is required",
                    ErrorCodes.VALIDATION_FAILED,
                    HttpStatus.BAD_REQUEST);
        }

        Task task = new Task(TaskType.DISK_SCAN, TaskStatus.RUNNING, "Disk scan: " + request.getDrive());
        Task savedTask = taskRepository.save(task);

        final String taskId = savedTask.getId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(savedTask);
            diskService.scan(t, request);
        });

        return ResponseEntity.accepted().body(new DiskScanResponse(
                savedTask.getId(),
                "/api/disk/stream/" + savedTask.getId()));
    }

    @GetMapping("/stream/{taskId}")
    public SSEView stream(@PathVariable String taskId) {
        taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return new SSEView(taskId);
    }

    public static class SSEView {
        private final String taskId;

        public SSEView(String taskId) {
            this.taskId = taskId;
        }

        public String getTaskId() { return taskId; }
    }
}
