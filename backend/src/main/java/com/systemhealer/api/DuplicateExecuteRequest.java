package com.systemhealer.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Collections;
import java.util.List;

public class DuplicateExecuteRequest {
    @NotBlank(message = "Confirm token is required")
    private String confirmToken;

    @NotEmpty(message = "File IDs must contain at least one item")
    private List<String> fileIds = Collections.emptyList();

    public DuplicateExecuteRequest() {}

    public String getConfirmToken() { return confirmToken; }
    public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }

    public List<String> getFileIds() { return fileIds; }
    public void setFileIds(List<String> fileIds) { this.fileIds = fileIds != null ? fileIds : Collections.emptyList(); }
}