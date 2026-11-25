package com.systemhealer.api;

public class CreateRestorePointRequest {
    private String description;

    public CreateRestorePointRequest() {}

    public CreateRestorePointRequest(String description) {
        this.description = description;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}