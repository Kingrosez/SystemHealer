package com.systemhealer.api;

public class DiskScanRequest {
    private String drive;
    private Integer maxDepth = 3;

    public String getDrive() { return drive; }
    public void setDrive(String drive) { this.drive = drive; }

    public Integer getMaxDepth() { return maxDepth; }
    public void setMaxDepth(Integer maxDepth) { this.maxDepth = maxDepth; }
}
