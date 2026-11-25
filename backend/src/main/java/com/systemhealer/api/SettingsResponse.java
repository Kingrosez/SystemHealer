package com.systemhealer.api;

import java.util.List;

public class SettingsResponse {
    private int logRetentionDays;
    private List<String> defaultScanRoots;
    private String theme;
    private boolean createRestorePointByDefault;

    public SettingsResponse() {}

    public SettingsResponse(int logRetentionDays, List<String> defaultScanRoots, String theme, boolean createRestorePointByDefault) {
        this.logRetentionDays = logRetentionDays;
        this.defaultScanRoots = defaultScanRoots;
        this.theme = theme;
        this.createRestorePointByDefault = createRestorePointByDefault;
    }

    public int getLogRetentionDays() { return logRetentionDays; }
    public void setLogRetentionDays(int logRetentionDays) { this.logRetentionDays = logRetentionDays; }

    public List<String> getDefaultScanRoots() { return defaultScanRoots; }
    public void setDefaultScanRoots(List<String> defaultScanRoots) { this.defaultScanRoots = defaultScanRoots; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public boolean isCreateRestorePointByDefault() { return createRestorePointByDefault; }
    public void setCreateRestorePointByDefault(boolean createRestorePointByDefault) { this.createRestorePointByDefault = createRestorePointByDefault; }
}