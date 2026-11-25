package com.systemhealer.api;

import java.util.List;

public class DuplicateScanRequest {
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