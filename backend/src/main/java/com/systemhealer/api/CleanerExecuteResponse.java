package com.systemhealer.api;

import java.util.List;

public class CleanerExecuteResponse {
    private int deleted;
    private long freedBytes;
    private List<String> failures;

    public CleanerExecuteResponse() {}

    public CleanerExecuteResponse(int deleted, long freedBytes, List<String> failures) {
        this.deleted = deleted;
        this.freedBytes = freedBytes;
        this.failures = failures;
    }

    public int getDeleted() { return deleted; }
    public void setDeleted(int deleted) { this.deleted = deleted; }

    public long getFreedBytes() { return freedBytes; }
    public void setFreedBytes(long freedBytes) { this.freedBytes = freedBytes; }

    public List<String> getFailures() { return failures; }
    public void setFailures(List<String> failures) { this.failures = failures; }
}