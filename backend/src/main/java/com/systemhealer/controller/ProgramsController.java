package com.systemhealer.controller;

import com.systemhealer.api.LeftoversExecuteRequest;
import com.systemhealer.api.LeftoversExecuteResponse;
import com.systemhealer.api.LeftoversPreviewResponse;
import com.systemhealer.api.ProgramsResponse;
import com.systemhealer.api.SSEView;
import com.systemhealer.api.UninstallRequest;
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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/programs")
@Validated
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
        if (page < 0 || size <= 0 || size > 1000) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(programService.getPrograms(search, page, size));
    }

    @PostMapping("/{id}/uninstall")
    public ResponseEntity<UninstallResponse> uninstall(
            @PathVariable @NotBlank(message = "Program ID cannot be empty") String id,
            @RequestBody(required = false) @Valid UninstallRequest request) {
        try {
            Task task = taskRepository.save(new Task(TaskType.PROGRAM_UNINSTALL, TaskStatus.PENDING, "Uninstall: " + id));

            final String taskId = task.getId();
            final String programId = id;
            final boolean force = request != null && request.isForce();
            CompletableFuture.runAsync(() -> {
                try {
                    Task storedTask = taskRepository.findById(taskId).orElse(task);
                    programService.uninstall(storedTask, programId, force);
                } catch (Exception e) {
                    // Log error but don't throw - task status will be updated via exception handler
                    System.err.println("Async uninstall failed for task " + taskId + ": " + e.getMessage());
                }
            });

            return ResponseEntity.accepted().body(new UninstallResponse(task.getId(), "/api/programs/" + id + "/stream/" + task.getId()));
        } catch (Exception e) {
            throw new SystemHealerException(
                    "Failed to initiate uninstall: " + e.getMessage(),
                    ErrorCodes.UNINSTALL_FAILED,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/leftovers/preview")
    public ResponseEntity<LeftoversPreviewResponse> leftoversPreview(
            @PathVariable @NotBlank(message = "Program ID cannot be empty") String id) {
        try {
            LeftoversPreviewResponse response = programService.getLeftoversPreview(id);
            String token = tokenService.generateToken("leftovers-" + id + "-" + UUID.randomUUID());
            response.setConfirmToken(token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new SystemHealerException(
                    "Failed to get leftovers preview: " + e.getMessage(),
                    ErrorCodes.PREVIEW_FAILED,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{id}/leftovers/execute")
    public ResponseEntity<LeftoversExecuteResponse> leftoversExecute(
            @PathVariable @NotBlank(message = "Program ID cannot be empty") String id,
            @RequestBody @Valid LeftoversExecuteRequest request) {
        tokenService.validateToken(request.getConfirmToken())
                .orElseThrow(() -> new SystemHealerException(
                        "Invalid or expired confirmation token",
                        ErrorCodes.INVALID_CONFIRM_TOKEN,
                        HttpStatus.CONFLICT));
        tokenService.consumeToken(request.getConfirmToken());

        try {
            LeftoversExecuteResponse response = programService.executeLeftovers(id, request.getFiles(), request.getRegistryKeys());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new SystemHealerException(
                    "Failed to execute leftovers cleanup: " + e.getMessage(),
                    ErrorCodes.LEFTOVERS_EXECUTE_FAILED,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}/stream/{taskId}")
    public SSEView uninstallStream(
            @PathVariable @NotBlank(message = "Program ID cannot be empty") String id,
            @PathVariable @NotBlank(message = "Task ID cannot be empty") String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return new SSEView(taskId);
    }
}