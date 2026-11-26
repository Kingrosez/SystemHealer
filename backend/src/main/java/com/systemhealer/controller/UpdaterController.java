package com.systemhealer.controller;

import com.systemhealer.api.UpdaterExecuteResponse;
import com.systemhealer.api.UpdaterScanResponse;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.UpdaterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/updater")
public class UpdaterController {

    @Autowired
    private UpdaterService updaterService;

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/scan")
    public ResponseEntity<UpdaterScanResponse> scan() {
        return ResponseEntity.ok(updaterService.scan());
    }

    @PostMapping("/execute")
    public ResponseEntity<UpdaterExecuteResponse> execute(@RequestBody UpdaterExecuteRequest request) {
        Task task = taskRepository.save(new Task(TaskType.UPDATER, TaskStatus.RUNNING, "Update: " + request.getIds()));

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
    public SSEView stream(@PathVariable String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return new SSEView(taskId);
    }

    public static class UpdaterExecuteRequest {
        private java.util.List<String> ids;

        public java.util.List<String> getIds() { return ids; }
        public void setIds(java.util.List<String> ids) { this.ids = ids; }
    }

    public static class SSEView {
        private final String taskId;

        public SSEView(String taskId) {
            this.taskId = taskId;
        }

        public String getTaskId() { return taskId; }
    }
}