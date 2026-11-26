package com.systemhealer.api;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class UpdaterExecuteRequest {
    @NotEmpty(message = "IDs must contain at least one item")
    private List<String> ids;

    public UpdaterExecuteRequest() {}

    public List<String> getIds() { return ids; }
    public void setIds(List<String> ids) { this.ids = ids; }
}