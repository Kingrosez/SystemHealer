package com.systemhealer.api;

public class RepairStartResponse {
    private final String taskId;
    private final String streamUrl;
    private final String restorePointStatus;
    private final String restorePointToken;

    public RepairStartResponse() {
        this.taskId = null;
        this.streamUrl = null;
        this.restorePointStatus = null;
        this.restorePointToken = null;
    }

    public RepairStartResponse(String taskId, String streamUrl, String restorePointStatus, String restorePointToken) {
        this.taskId = taskId;
        this.streamUrl = streamUrl;
        this.restorePointStatus = restorePointStatus;
        this.restorePointToken = restorePointToken;
    }

    public String getTaskId() { return taskId; }
    public String getStreamUrl() { return streamUrl; }
    public String getRestorePointStatus() { return restorePointStatus; }
    public String getRestorePointToken() { return restorePointToken; }
}