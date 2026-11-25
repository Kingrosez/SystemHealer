package com.systemhealer.controller;

import com.systemhealer.api.CleanerExecuteResponse;
import com.systemhealer.api.CleanerPreviewResponse;
import com.systemhealer.api.CleanerScanRequest;
import com.systemhealer.api.CleanerScanResponse;
import com.systemhealer.api.DuplicateExecuteResponse;
import com.systemhealer.api.DuplicateGroupsResponse;
import com.systemhealer.api.DuplicateScanRequest;
import com.systemhealer.api.DuplicateScanResponse;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.CleanerService;
import com.systemhealer.util.ConfirmationTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/cleaner")
public class CleanerController {

    @Autowired
    private CleanerService cleanerService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ConfirmationTokenService tokenService;

    @PostMapping("/scan")
    public ResponseEntity<CleanerScanResponse> scan(@RequestBody CleanerScanRequest request) {
        Task task = new Task(TaskType.CLEANER, TaskStatus.RUNNING, "Cleaner scan");
        task = taskRepository.save(task);

        final String taskId = task.getId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(task);
            cleanerService.startScan(t, request);
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
    public ResponseEntity<CleanerExecuteResponse> execute(@RequestBody CleanerExecuteRequest request) {
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
    public ResponseEntity<DuplicateScanResponse> duplicateScan(@RequestBody DuplicateScanRequest request) {
        Task task = new Task(TaskType.DUPLICATE_SCAN, TaskStatus.RUNNING, "Duplicate scan");
        task = taskRepository.save(task);

        final String taskId = task.getId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(task);
            cleanerService.startDuplicateScan(t, request);
        });

        return ResponseEntity.accepted().body(new DuplicateScanResponse(task.getId(), "/api/cleaner/duplicates/stream/" + task.getId()));
    }

    @GetMapping("/duplicates/stream/{taskId}")
    public SSEView duplicateStream(@PathVariable String taskId) {
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
        return ResponseEntity.ok(cleanerService.getDuplicateGroups(page, size));
    }

    @PostMapping("/duplicates/execute")
    public ResponseEntity<DuplicateExecuteResponse> duplicateExecute(@RequestBody DuplicateExecuteRequest request) {
        tokenService.validateToken(request.getConfirmToken())
                .orElseThrow(() -> new SystemHealerException(
                        "Invalid or expired confirmation token",
                        ErrorCodes.INVALID_CONFIRM_TOKEN,
                        HttpStatus.CONFLICT));
        tokenService.consumeToken(request.getConfirmToken());

        DuplicateExecuteResponse response = cleanerService.executeDuplicates(request.getFileIds());
        return ResponseEntity.ok(response);
    }

    public static class CleanerExecuteRequest {
        private String confirmToken;
        private java.util.List<String> paths;

        public CleanerExecuteRequest() {}
        public String getConfirmToken() { return confirmToken; }
        public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }
        public java.util.List<String> getPaths() { return paths; }
        public void setPaths(java.util.List<String> paths) { this.paths = paths; }
    }

    public static class DuplicateExecuteRequest {
        private String confirmToken;
        private java.util.List<String> fileIds;

        public DuplicateExecuteRequest() {}
        public String getConfirmToken() { return confirmToken; }
        public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }
        public java.util.List<String> getFileIds() { return fileIds; }
        public void setFileIds(java.util.List<String> fileIds) { this.fileIds = fileIds; }
    }

    public static class CleanerScanResponse {
        private final String taskId;
        private final String streamUrl;

        public CleanerScanResponse(String taskId, String streamUrl) {
            this.taskId = taskId;
            this.streamUrl = streamUrl;
        }

        public String getTaskId() { return taskId; }
        public String getStreamUrl() { return streamUrl; }
    }

    public static class DuplicateScanResponse {
        private final String taskId;
        private final String streamUrl;

        public DuplicateScanResponse(String taskId, String streamUrl) {
            this.taskId = taskId;
            this.streamUrl = streamUrl;
        }

        public String getTaskId() { return taskId; }
        public String getStreamUrl() { return streamUrl; }
    }

    public static class SSEView {
        private final String taskId;

        public SSEView(String taskId) {
            this.taskId = taskId;
        }

        public String getTaskId() { return taskId; }
    }
}