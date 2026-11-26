package com.systemhealer.service;

import com.systemhealer.api.CleanerExecuteResponse;
import com.systemhealer.api.CleanerPreviewResponse;
import com.systemhealer.api.CleanerScanRequest;
import com.systemhealer.api.DuplicateExecuteResponse;
import com.systemhealer.api.DuplicateGroupsResponse;
import com.systemhealer.api.DuplicateScanRequest;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CleanerService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommandRunner commandRunner;

    @Async
    public void startScan(Task task, CleanerScanRequest request) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // Validate roots - must have at least one root path
            if (request.getRoots() == null || request.getRoots().isEmpty()) {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorCode("INVALID_INPUT");
                task.setErrorMessage("Scan requires at least one root path");
                taskRepository.save(task);
                return;
            }

            // Simulated scan - in production, use PowerShell to scan for temp files, cache, logs
            for (String root : request.getRoots()) {
                if (task.getStatus() != TaskStatus.RUNNING) break;
                String psCommand = "Get-ChildItem -Path " + root + " -Recurse -Force | Where-Object { $_.Extension -eq '.tmp' -or $_.Extension -eq '.log' } | Select-Object FullName, Length";
                CommandRunner.CommandResult result = commandRunner.run(java.util.List.of("powershell", "-Command", psCommand));
                if (result.failed()) {
                    task.setStatus(TaskStatus.FAILED);
                    task.setErrorCode("COMMAND_FAILED");
                    task.setErrorMessage("Scan failed: " + result.getStderr());
                    taskRepository.save(task);
                    return;
                }
            }

            if (task.getStatus() == TaskStatus.RUNNING) {
                task.setStatus(TaskStatus.SUCCESS);
                taskRepository.save(task);
            }
        } catch (Exception e) {
            task.setStatus(TaskStatus.FAILED);
            task.setErrorCode("CLEANER_SCAN_FAILED");
            task.setErrorMessage(e.getMessage());
            taskRepository.save(task);
        }
    }

    public CleanerPreviewResponse getPreview() {
        // Return simulated preview data
        CleanerPreviewResponse response = new CleanerPreviewResponse(
                java.util.List.of(
                        new CleanerPreviewResponse.CleanerPreviewItem("C:\\Windows\\Temp\\file1.tmp", "temp", 1024),
                        new CleanerPreviewResponse.CleanerPreviewItem("C:\\Users\\user\\AppData\\Local\\Cache\\cache.dat", "cache", 2048)
                ),
                3072,
                ""
        );
        return response;
    }

    public CleanerExecuteResponse execute(List<String> paths) {
        // Simulated execution
        return new CleanerExecuteResponse(paths.size(), paths.size() * 1024, Collections.emptyList());
    }

    @Async
    public void startDuplicateScan(Task task, DuplicateScanRequest request) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // Validate roots - must have at least one root path
            if (request.getRoots() == null || request.getRoots().isEmpty()) {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorCode("INVALID_INPUT");
                task.setErrorMessage("Duplicate scan requires at least one root path");
                taskRepository.save(task);
                return;
            }

            // Simulated duplicate scan using PowerShell
            for (String root : request.getRoots()) {
                if (task.getStatus() != TaskStatus.RUNNING) break;
                String psCommand = "Get-FileHash -Algorithm SHA256 -Path " + root + "\\*";
                CommandRunner.CommandResult result = commandRunner.run(java.util.List.of("powershell", "-Command", psCommand));
                if (result.failed()) {
                    task.setStatus(TaskStatus.FAILED);
                    task.setErrorCode("COMMAND_FAILED");
                    task.setErrorMessage("Duplicate scan failed: " + result.getStderr());
                    taskRepository.save(task);
                    return;
                }
            }

            if (task.getStatus() == TaskStatus.RUNNING) {
                task.setStatus(TaskStatus.SUCCESS);
                taskRepository.save(task);
            }
        } catch (Exception e) {
            task.setStatus(TaskStatus.FAILED);
            task.setErrorCode("DUPLICATE_SCAN_FAILED");
            task.setErrorMessage(e.getMessage());
            taskRepository.save(task);
        }
    }

    public DuplicateGroupsResponse getDuplicateGroups(int page, int size) {
        // Return simulated duplicate groups
        return new DuplicateGroupsResponse(
                java.util.List.of(
                        new DuplicateGroupsResponse.DuplicateGroup(
                                "group-1",
                                "sha256:abc123",
                                1024,
                                java.util.List.of(
                                        new DuplicateGroupsResponse.DuplicateGroup.DuplicateFile("file-1", "C:\\Data\\file.txt", "2026-01-01T00:00:00Z"),
                                        new DuplicateGroupsResponse.DuplicateGroup.DuplicateFile("file-2", "D:\\Backup\\file.txt", "2026-01-02T00:00:00Z")
                                )
                        )
                ),
                page, size, 1
        );
    }

    public DuplicateExecuteResponse executeDuplicates(List<String> fileIds) {
        return new DuplicateExecuteResponse(fileIds.size(), fileIds.size() * 1024, Collections.emptyList());
    }
}