package com.systemhealer.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Request body for starting a repair operation.
 */
public class RepairStartRequest {
    @NotNull(message = "Actions cannot be null")
    @NotEmpty(message = "Actions must contain at least one item")
    private List<String> actions;
    private Boolean createRestorePoint = false;

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