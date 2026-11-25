package com.systemhealer.api;

public class RestoreRequest {
    private String pointId;
    private boolean confirm;

    public RestoreRequest() {}

    public RestoreRequest(String pointId, boolean confirm) {
        this.pointId = pointId;
        this.confirm = confirm;
    }

    public String getPointId() { return pointId; }
    public void setPointId(String pointId) { this.pointId = pointId; }

    public boolean isConfirm() { return confirm; }
    public void setConfirm(boolean confirm) { this.confirm = confirm; }
}