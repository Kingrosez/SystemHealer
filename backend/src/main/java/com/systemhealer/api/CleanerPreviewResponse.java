package com.systemhealer.api;

import java.util.List;

public class CleanerPreviewResponse {
    private List<CleanerPreviewItem> items;
    private long totalSizeBytes;
    private String confirmToken;

    public CleanerPreviewResponse() {}

    public CleanerPreviewResponse(List<CleanerPreviewItem> items, long totalSizeBytes, String confirmToken) {
        this.items = items;
        this.totalSizeBytes = totalSizeBytes;
        this.confirmToken = confirmToken;
    }

    public List<CleanerPreviewItem> getItems() { return items; }
    public void setItems(List<CleanerPreviewItem> items) { this.items = items; }

    public long getTotalSizeBytes() { return totalSizeBytes; }
    public void setTotalSizeBytes(long totalSizeBytes) { this.totalSizeBytes = totalSizeBytes; }

    public String getConfirmToken() { return confirmToken; }
    public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }

    public static class CleanerPreviewItem {
        private String path;
        private String category;
        private long sizeBytes;

        public CleanerPreviewItem() {}

        public CleanerPreviewItem(String path, String category, long sizeBytes) {
            this.path = path;
            this.category = category;
            this.sizeBytes = sizeBytes;
        }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    }
}