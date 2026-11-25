package com.systemhealer.service;

import com.systemhealer.api.UpdaterScanResponse;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UpdaterService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommandRunner commandRunner;

    public UpdaterScanResponse scan() {
        // Simulated scan - in production, use winget list --upgrade-available
        return new UpdaterScanResponse(
                true,
                List.of(
                        new UpdaterScanResponse.SoftwareUpdate(
                                UUID.randomUUID().toString(),
                                "Example App",
                                "1.2.3",
                                "1.3.0"
                        ),
                        new UpdaterScanResponse.SoftwareUpdate(
                                UUID.randomUUID().toString(),
                                "Another Tool",
                                "2.0.0",
                                "2.1.0"
                        )
                )
        );
    }

    @Async
    public void execute(Task task, List<String> ids) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // In production: winget upgrade --id <id> for each
            for (String id : ids) {
                if (task.getStatus() != TaskStatus.RUNNING) break;
                CommandRunner.CommandResult result = commandRunner.run(List.of("winget", "upgrade", "--id", id, "--silent"));
                if (result.failed()) {
                    task.setStatus(TaskStatus.FAILED);
                    task.setErrorCode("COMMAND_FAILED");
                    task.setErrorMessage("Update failed for " + id + ": " + result.getStderr());
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
            task.setErrorCode("UPDATER_FAILED");
            task.setErrorMessage(e.getMessage());
            taskRepository.save(task);
        }
    }
}