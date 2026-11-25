package com.systemhealer.api;

import java.util.List;

public class CleanerScanRequest {
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