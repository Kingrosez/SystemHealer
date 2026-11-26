package com.systemhealer.service;

import com.systemhealer.api.RepairStartRequest;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.RepairLog;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.RepairLogRepository;
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

    @Autowired
    private RepairLogRepository logRepository;

    private void log(String taskId, String level, String step, String message) {
        RepairLog logEntry = new RepairLog(taskId, message, level, step);
        logRepository.save(logEntry);
    }

    /**
     * Start a repair operation.
     * Creates task record and begins async command execution.
     */
    @Async
    public void startRepair(Task task, RepairStartRequest request) {
        String taskId = task.getId();
        try {
            log(taskId, "INFO", "init", "Starting repair with actions: " + request.getActions());
            task.setStatus(TaskStatus.RUNNING);
            taskRepository.save(task);

            // Build SFC/DISM command based on requested actions
            java.util.List<String> commands = buildRepairCommands(request.getActions());
            log(taskId, "INFO", "commands", "Executing " + commands.size() + " repair command(s)");

            int commandIndex = 0;
            for (String cmd : commands) {
                if (task.getStatus() != TaskStatus.RUNNING) break;

                int progress = (int) ((++commandIndex * 100) / Math.max(1, commands.size()));
                log(taskId, "INFO", "step", "Executing: " + cmd);

                CommandRunner.CommandResult result = commandRunner.run(java.util.List.of(cmd));

                // Update task progress and status based on result
                if (result.failed()) {
                    log(taskId, "ERROR", "failed", "Command failed: " + result.getStderr());
                    task.setStatus(TaskStatus.FAILED);
                    task.setErrorCode(ErrorCodes.COMMAND_FAILED);
                    task.setErrorMessage("Repair command failed: " + result.getStderr());
                    taskRepository.save(task);
                    return;
                }

                log(taskId, "INFO", "step", "Completed: " + cmd);
                task.setProgressPercent(progress);
                taskRepository.save(task);
            }

            if (task.getStatus() != TaskStatus.FAILED) {
                task.setProgressPercent(100);
                task.setStatus(TaskStatus.SUCCESS);
                taskRepository.save(task);
                log(taskId, "INFO", "complete", "Repair completed successfully");
            }

        } catch (Exception e) {
            log(taskId, "ERROR", "error", "Repair failed: " + e.getMessage());
            try {
                task.setStatus(TaskStatus.FAILED);
                task.setErrorCode(ErrorCodes.REPAIR_PROCESS_FAILED);
                task.setErrorMessage("Repair process error: " + e.getMessage());
                taskRepository.save(task);
            } catch (Exception ex) {
                log(taskId, "ERROR", "fatal", "Failed to update task: " + ex.getMessage());
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