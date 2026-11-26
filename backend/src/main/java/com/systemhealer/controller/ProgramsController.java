package com.systemhealer.controller;

import com.systemhealer.api.LeftoversExecuteResponse;
import com.systemhealer.api.LeftoversPreviewResponse;
import com.systemhealer.api.ProgramsResponse;
import com.systemhealer.api.UninstallResponse;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.ProgramService;
import com.systemhealer.util.ConfirmationTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/programs")
public class ProgramsController {

    @Autowired
    private ProgramService programService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ConfirmationTokenService tokenService;

    @GetMapping
    public ResponseEntity<ProgramsResponse> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(programService.getPrograms(search, page, size));
    }

    @PostMapping("/{id}/uninstall")
    public ResponseEntity<UninstallResponse> uninstall(
            @PathVariable String id,
            @RequestBody(required = false) UninstallRequest request) {
        Task task = new Task(TaskType.PROGRAM_UNINSTALL, TaskStatus.RUNNING, "Uninstall: " + id);
        Task savedTask = taskRepository.save(task);

        final String taskId = savedTask.getId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(savedTask);
            programService.uninstall(t, id, request != null && request.isForce());
        });

        return ResponseEntity.accepted().body(new UninstallResponse(savedTask.getId(), "/api/programs/" + id + "/stream/" + savedTask.getId()));
    }

    @PostMapping("/{id}/leftovers/preview")
    public ResponseEntity<LeftoversPreviewResponse> leftoversPreview(@PathVariable String id) {
        LeftoversPreviewResponse response = programService.getLeftoversPreview(id);
        String token = tokenService.generateToken("leftovers-" + id + "-" + UUID.randomUUID());
        response.setConfirmToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/leftovers/execute")
    public ResponseEntity<LeftoversExecuteResponse> leftoversExecute(
            @PathVariable String id,
            @RequestBody LeftoversExecuteRequest request) {
        tokenService.validateToken(request.getConfirmToken())
                .orElseThrow(() -> new SystemHealerException(
                        "Invalid or expired confirmation token",
                        ErrorCodes.INVALID_CONFIRM_TOKEN,
                        HttpStatus.CONFLICT));
        tokenService.consumeToken(request.getConfirmToken());

        LeftoversExecuteResponse response = programService.executeLeftovers(id, request.getFiles(), request.getRegistryKeys());
        return ResponseEntity.ok(response);
    }

    public static class UninstallRequest {
        private boolean force = false;

        public boolean isForce() { return force; }
        public void setForce(boolean force) { this.force = force; }
    }

    public static class UninstallResponse {
        private final String taskId;
        private final String streamUrl;

        public UninstallResponse(String taskId, String streamUrl) {
            this.taskId = taskId;
            this.streamUrl = streamUrl;
        }

        public String getTaskId() { return taskId; }
        public String getStreamUrl() { return streamUrl; }
    }

    public static class LeftoversExecuteRequest {
        private String confirmToken;
        private java.util.List<String> files;
        private java.util.List<String> registryKeys;

        public String getConfirmToken() { return confirmToken; }
        public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }
        public java.util.List<String> getFiles() { return files; }
        public void setFiles(java.util.List<String> files) { this.files = files; }
        public java.util.List<String> getRegistryKeys() { return registryKeys; }
        public void setRegistryKeys(java.util.List<String> registryKeys) { this.registryKeys = registryKeys; }
    }
}