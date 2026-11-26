package com.systemhealer.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class DuplicateScanRequest {
    @NotNull(message = "Roots cannot be null")
    @NotEmpty(message = "Roots must contain at least one path")
    private List<String> roots;
    private Long minSizeBytes;

    public DuplicateScanRequest() {}

    public DuplicateScanRequest(List<String> roots, Long minSizeBytes) {
        this.roots = roots;
        this.minSizeBytes = minSizeBytes;
    }

    public List<String> getRoots() { return roots; }
    public void setRoots(List<String> roots) { this.roots = roots; }

    public Long getMinSizeBytes() { return minSizeBytes; }
    public void setMinSizeBytes(Long minSizeBytes) { this.minSizeBytes = minSizeBytes; }
}