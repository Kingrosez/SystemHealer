package com.systemhealer.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CleanerScanRequest {
    @NotNull(message = "Roots cannot be null")
    @NotEmpty(message = "Roots must contain at least one path")
    private List<String> roots;
    private List<String> categories;

    public CleanerScanRequest() {}

    public CleanerScanRequest(List<String> roots, List<String> categories) {
        this.roots = roots;
        this.categories = categories;
    }

    public List<String> getRoots() { return roots; }
    public void setRoots(List<String> roots) { this.roots = roots; }

    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }
}