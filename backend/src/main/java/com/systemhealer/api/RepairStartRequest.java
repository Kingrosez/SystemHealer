package com.systemhealer.api;

import java.util.List;

/**
 * Request body for starting a repair operation.
 */
public class RepairStartRequest {
    private List<String> actions;
    private boolean createRestorePoint;

    public RepairStartRequest() {}

    public RepairStartRequest(List<String> actions, boolean createRestorePoint) {
        this.actions = actions;
        this.createRestorePoint = createRestorePoint;
    }

    public List<String> getActions() {
        return actions;
    }

    public void setActions(List<String> actions) {
        this.actions = actions;
    }

    public boolean isCreateRestorePoint() {
        return createRestorePoint;
    }

    public void setCreateRestorePoint(boolean createRestorePoint) {
        this.createRestorePoint = createRestorePoint;
    }
}