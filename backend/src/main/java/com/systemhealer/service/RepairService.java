package com.systemhealer.service;

import com.systemhealer.api.RepairStartRequest;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RepairService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CommandRunner commandRunner;

    /**
     * Start a repair operation.
     * Creates task record and begins async command execution.
     */
    @Async
    public void startRepair(Task task, RepairStartRequest request) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // Build SFC/DISM command based on requested actions
            java.util.List<String> commands = buildRepairCommands(request.getActions());

            for (String cmd : commands) {
                if (task.getStatus() != TaskStatus.RUNNING) break;

                CommandRunner.CommandResult result = commandRunner.run(java.util.List.of(cmd));

                // Update task progress and status based on result
                if (result.failed()) {
                    task.setStatus(TaskStatus.FAILED);
                    task.setErrorCode(ErrorCodes.COMMAND_FAILED);
                    task.setErrorMessage("Repair command failed: " + result.getStderr());
                    taskRepository.save(task);
                    break;
                }

                // Update progress based on command output
                task.setProgressPercent(50); // Simplified progress tracking
                taskRepository.save(task);
            }

            if (task.getStatus() == TaskStatus.RUNNING) {
                task.setStatus(TaskStatus.SUCCESS);
                taskRepository.save(task);
            }

        } catch (Exception e) {
            try {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorCode(ErrorCodes.REPAIR_PROCESS_FAILED);
                task.setErrorMessage("Repair process error: " + e.getMessage());
                taskRepository.save(task);
            } catch (Exception ex) {
                // Log error if task repo also fails
            }
        }
    }

    /**
     * Cancel a running repair task.
     */
    public void cancelRepair(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));

        task.setStatus(TaskStatus.CANCELLED);
        taskRepository.save(task);
    }

    /**
     * Build Windows commands based on requested repair actions.
     */
    private List<String> buildRepairCommands(List<String> actions) {
        java.util.List<String> commands = java.util.Collections.synchronizedList(new java.util.ArrayList<>());

        for (String action : actions) {
            switch (action.toLowerCase()) {
                case "sfc":
                    commands.add("sfc /scannow");
                    break;
                case "dism":
                    commands.add("dism /online /cleanup-image /restorehealth");
                    break;
                case "network":
                    commands.add("netsh int ip reset");
                    break;
                case "windows-update":
                    commands.add("wuauclt /resetauthorization");
                    break;
                default:
                    // Unknown action - skip
                    break;
            }
        }

        return commands;
    }
}