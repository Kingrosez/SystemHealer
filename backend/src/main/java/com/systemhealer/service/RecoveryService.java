package com.systemhealer.service;

import com.systemhealer.api.CreateRestorePointResponse;
import com.systemhealer.api.RestorePointResponse;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RecoveryService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommandRunner commandRunner;

    public RestorePointResponse getRestorePoints() {
        // In production: query Windows restore points via vssadmin or PowerShell
        return new RestorePointResponse(List.of(
                new RestorePointResponse.RestorePoint(
                        UUID.randomUUID().toString(),
                        "Pre-repair 2026-11-23",
                        ZonedDateTime.now().minusDays(1).toString(),
                        12
                ),
                new RestorePointResponse.RestorePoint(
                        UUID.randomUUID().toString(),
                        "Before cleanup",
                        ZonedDateTime.now().minusDays(3).toString(),
                        11
                )
        ));
    }

    public CreateRestorePointResponse createRestorePoint(String description) {
        // In production: use Checkpoint-Computer or vssadmin create shadow
        CommandRunner.CommandResult result;
        try {
            result = commandRunner.run(List.of(
                    "powershell", "-Command", "Checkpoint-Computer -Description \"" + description + "\" -RestorePointType MODIFY_SETTINGS"
            ));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Create restore point interrupted", e);
        } catch (IOException e) {
            throw new RuntimeException("Create restore point failed", e);
        }

        if (result.failed()) {
            throw new RuntimeException("Failed to create restore point: " + result.getStderr());
        }

        return new CreateRestorePointResponse(UUID.randomUUID().toString(), ZonedDateTime.now().toString());
    }

    @Async
    public void restore(Task task, String pointId) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // In production: use rstrui.exe or PowerShell Restore-Computer
            CommandRunner.CommandResult result;
            try {
                result = commandRunner.run(List.of(
                        "powershell", "-Command", "Restore-Computer -RestorePoint " + pointId
                ));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Restore interrupted", e);
            }

            if (result.failed()) {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorCode("COMMAND_FAILED");
                task.setErrorMessage("Restore failed: " + result.getStderr());
            } else {
                task.setStatus(TaskStatus.SUCCESS);
            }
            taskRepository.save(task);
        } catch (Exception e) {
            task.setStatus(TaskStatus.FAILED);
            task.setErrorCode("RESTORE_FAILED");
            task.setErrorMessage(e.getMessage());
            taskRepository.save(task);
        }
    }
}