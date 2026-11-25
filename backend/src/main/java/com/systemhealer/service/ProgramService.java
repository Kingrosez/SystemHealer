package com.systemhealer.service;

import com.systemhealer.api.LeftoversExecuteResponse;
import com.systemhealer.api.LeftoversPreviewResponse;
import com.systemhealer.api.ProgramsResponse;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class ProgramService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommandRunner commandRunner;

    public ProgramsResponse getPrograms(String search, int page, int size) {
        // Simulated list of installed programs - in production, query Windows registry/WMI
        return new ProgramsResponse(
                List.of(
                        new ProgramsResponse.Program(
                                UUID.randomUUID().toString(),
                                "Example Application",
                                "Example Inc.",
                                "1.2.3",
                                "2025-06-01T00:00:00Z",
                                123456789,
                                "MsiExec.exe /X{12345678-1234-1234-1234-123456789012}"
                        ),
                        new ProgramsResponse.Program(
                                UUID.randomUUID().toString(),
                                "Another App",
                                "Another Corp",
                                "4.5.6",
                                "2025-08-15T00:00:00Z",
                                987654321,
                                "C:\\Program Files\\AnotherApp\\uninstall.exe"
                        )
                ),
                page, size, 2
        );
    }

    @Async
    public void uninstall(Task task, String programId, boolean force) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // In production: get uninstallString from registry and run it
            String uninstallCommand = "MsiExec.exe /X{" + programId + "}" + (force ? " /quiet /norestart" : "");
            CommandRunner.CommandResult result = commandRunner.run(List.of(uninstallCommand));

            if (result.failed()) {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorCode("COMMAND_FAILED");
                task.setErrorMessage("Uninstall failed: " + result.getStderr());
            } else {
                task.setStatus(TaskStatus.SUCCESS);
            }
            taskRepository.save(task);
        } catch (Exception e) {
            task.setStatus(TaskStatus.FAILED);
            task.setErrorCode("UNINSTALL_FAILED");
            task.setErrorMessage(e.getMessage());
            taskRepository.save(task);
        }
    }

    public LeftoversPreviewResponse getLeftoversPreview(String programId) {
        // Simulated leftovers scan
        return new LeftoversPreviewResponse(
                List.of(
                        new LeftoversPreviewResponse.LeftoverFile("C:\\ProgramData\\" + programId, 4096),
                        new LeftoversPreviewResponse.LeftoverFile("C:\\Users\\user\\AppData\\Local\\" + programId, 2048)
                ),
                List.of("HKCU\\Software\\" + programId, "HKLM\\Software\\" + programId),
                ""
        );
    }

    public LeftoversExecuteResponse executeLeftovers(String programId, List<String> files, List<String> registryKeys) {
        // Simulated deletion
        int totalItems = files.size() + registryKeys.size();
        return new LeftoversExecuteResponse(totalItems, 0, Collections.emptyList());
    }
}