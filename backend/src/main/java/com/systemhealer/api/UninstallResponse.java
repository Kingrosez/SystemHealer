package com.systemhealer.api;

public class UninstallResponse {
    private String taskId;
    private String streamUrl;

    public UninstallResponse() {}

    public UninstallResponse(String taskId, String streamUrl) {
        this.taskId = taskId;
        this.streamUrl = streamUrl;
    }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getStreamUrl() { return streamUrl; }
    public void setStreamUrl(String streamUrl) { this.streamUrl = streamUrl; }
}