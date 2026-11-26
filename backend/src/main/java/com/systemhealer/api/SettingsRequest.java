package com.systemhealer.api;

import java.util.List;

public class SettingsRequest {
    private Integer logRetentionDays;
    private List<String> defaultScanRoots;
    private String theme;
    private Boolean createRestorePointByDefault;

    public SettingsRequest() {}

    public SettingsRequest(Integer logRetentionDays, List<String> defaultScanRoots, String theme, Boolean createRestorePointByDefault) {
        this.logRetentionDays = logRetentionDays;
        this.defaultScanRoots = defaultScanRoots;
        this.theme = theme;
        this.createRestorePointByDefault = createRestorePointByDefault;
    }

    public Integer getLogRetentionDays() { return logRetentionDays; }
    public void setLogRetentionDays(Integer logRetentionDays) { this.logRetentionDays = logRetentionDays; }

    public List<String> getDefaultScanRoots() { return defaultScanRoots; }
    public void setDefaultScanRoots(List<String> defaultScanRoots) { this.defaultScanRoots = defaultScanRoots; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public Boolean getCreateRestorePointByDefault() { return createRestorePointByDefault; }
    public void setCreateRestorePointByDefault(Boolean createRestorePointByDefault) { this.createRestorePointByDefault = createRestorePointByDefault; }
}