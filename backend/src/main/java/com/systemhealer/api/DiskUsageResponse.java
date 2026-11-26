package com.systemhealer.api;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class DiskUsageResponse {
    private List<DiskDrive> drives;
    private List<DiskUsageItem> usage;

    public DiskUsageResponse() {}

    public DiskUsageResponse(List<DiskDrive> drives, List<DiskUsageItem> usage) {
        this.drives = drives;
        this.usage = usage;
    }

    public List<DiskDrive> getDrives() { return drives; }
    public void setDrives(List<DiskDrive> drives) { this.drives = drives; }

    public List<DiskUsageItem> getUsage() { return usage; }
    public void setUsage(List<DiskUsageItem> usage) { this.usage = usage; }

    public static class DiskDrive {
        private String letter;
        private String label;
        private long totalBytes;
        private long usedBytes;
        private long freeBytes;
        private String fileSystem;

        public DiskDrive() {}

        public DiskDrive(String letter, String label, long totalBytes, long usedBytes, long freeBytes, String fileSystem) {
            this.letter = letter;
            this.label = label;
            this.totalBytes = totalBytes;
            this.usedBytes = usedBytes;
            this.freeBytes = freeBytes;
            this.fileSystem = fileSystem;
        }

        public String getLetter() { return letter; }
        public void setLetter(String letter) { this.letter = letter; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public long getTotalBytes() { return totalBytes; }
        public void setTotalBytes(long totalBytes) { this.totalBytes = totalBytes; }

        public long getUsedBytes() { return usedBytes; }
        public void setUsedBytes(long usedBytes) { this.usedBytes = usedBytes; }

        public long getFreeBytes() { return freeBytes; }
        public void setFreeBytes(long freeBytes) { this.freeBytes = freeBytes; }

        public String getFileSystem() { return fileSystem; }
        public void setFileSystem(String fileSystem) { this.fileSystem = fileSystem; }
    }

    public static class DiskUsageItem {
        private String path;
        private String name;
        private long sizeBytes;
        private boolean directory;
        private List<DiskUsageItem> children;

        public DiskUsageItem() {}

        public DiskUsageItem(String path, String name, long sizeBytes, boolean directory, List<DiskUsageItem> children) {
            this.path = path;
            this.name = name;
            this.sizeBytes = sizeBytes;
            this.directory = directory;
            this.children = children;
        }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

        @JsonProperty("isDirectory")
        public boolean isDirectory() { return directory; }
        public void setDirectory(boolean directory) { this.directory = directory; }

        public List<DiskUsageItem> getChildren() { return children; }
        public void setChildren(List<DiskUsageItem> children) { this.children = children; }
    }
}
