package com.systemhealer.api;

import java.util.List;

public class LeftoversExecuteResponse {
    private int deleted;
    private int failed;
    private List<String> failures;

    public LeftoversExecuteResponse() {}

    public LeftoversExecuteResponse(int deleted, int failed, List<String> failures) {
        this.deleted = deleted;
        this.failed = failed;
        this.failures = failures;
    }

    public int getDeleted() { return deleted; }
    public void setDeleted(int deleted) { this.deleted = deleted; }

    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }

    public List<String> getFailures() { return failures; }
    public void setFailures(List<String> failures) { this.failures = failures; }
}