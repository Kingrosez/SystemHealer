package com.systemhealer.api;

public class DiskScanResponse {
    private final String taskId;
    private final String streamUrl;

    public DiskScanResponse(String taskId, String streamUrl) {
        this.taskId = taskId;
        this.streamUrl = streamUrl;
    }

    public String getTaskId() { return taskId; }
    public String getStreamUrl() { return streamUrl; }
}
