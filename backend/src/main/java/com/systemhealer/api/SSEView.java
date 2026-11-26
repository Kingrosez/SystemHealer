package com.systemhealer.api;

public class SSEView {
    private final String taskId;

    public SSEView(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskId() { return taskId; }
}