package com.systemhealer.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Collections;
import java.util.List;

public class CleanerExecuteRequest {
    @NotBlank(message = "Confirm token is required")
    private String confirmToken;

    @NotEmpty(message = "Paths must contain at least one item")
    private List<String> paths = Collections.emptyList();

    public CleanerExecuteRequest() {}

    public String getConfirmToken() { return confirmToken; }
    public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }

    public List<String> getPaths() { return paths; }
    public void setPaths(List<String> paths) { this.paths = paths != null ? paths : Collections.emptyList(); }
}