package com.systemhealer.api;

/**
 * Response for repair preview (restore point check).
 */
public class RepairPreviewResponse {
    private boolean restorePointCreated;
    private String restorePointId;
    private String token;

    public RepairPreviewResponse() {}

    public RepairPreviewResponse(boolean restorePointCreated, String restorePointId, String token) {
        this.restorePointCreated = restorePointCreated;
        this.restorePointId = restorePointId;
        this.token = token;
    }

    public boolean isRestorePointCreated() {
        return restorePointCreated;
    }

    public void setRestorePointCreated(boolean restorePointCreated) {
        this.restorePointCreated = restorePointCreated;
    }

    public String getRestorePointId() {
        return restorePointId;
    }

    public void setRestorePointId(String restorePointId) {
        this.restorePointId = restorePointId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}