package com.systemhealer.api;

import jakarta.validation.constraints.NotBlank;
import java.util.Collections;
import java.util.List;

public class LeftoversExecuteRequest {
    @NotBlank(message = "Confirm token is required")
    private String confirmToken;

    private List<String> files = Collections.emptyList();
    private List<String> registryKeys = Collections.emptyList();

    public LeftoversExecuteRequest() {}

    public String getConfirmToken() { return confirmToken; }
    public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }

    public List<String> getFiles() { return files; }
    public void setFiles(List<String> files) { this.files = files != null ? files : Collections.emptyList(); }

    public List<String> getRegistryKeys() { return registryKeys; }
    public void setRegistryKeys(List<String> registryKeys) { this.registryKeys = registryKeys != null ? registryKeys : Collections.emptyList(); }
}