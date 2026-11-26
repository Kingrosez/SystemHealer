package com.systemhealer.api;

/**
 * Response for restore operation, contains the task ID for tracking.
 */
public class RestoreResponse {
    private final String taskId;

    public RestoreResponse() {
        this.taskId = null;
    }

    public RestoreResponse(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskId() { return taskId; }
}