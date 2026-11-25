package com.systemhealer.api;

public class CreateRestorePointResponse {
    private String id;
    private String createdAt;

    public CreateRestorePointResponse() {}

    public CreateRestorePointResponse(String id, String createdAt) {
        this.id = id;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}