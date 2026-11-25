package com.systemhealer.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import java.util.List;

@Entity
public class AppSettings {

    @Id
    private String id = "app";

    private int logRetentionDays = 90;

    @Lob
    private String defaultScanRootsJson = "[\"C:\\\\Users\"]";

    private String theme = "system";

    private boolean createRestorePointByDefault = true;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public AppSettings() {}

    public AppSettings(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getLogRetentionDays() { return logRetentionDays; }
    public void setLogRetentionDays(int logRetentionDays) { this.logRetentionDays = logRetentionDays; }

    public String getDefaultScanRootsJson() { return defaultScanRootsJson; }
    public void setDefaultScanRootsJson(String defaultScanRootsJson) { this.defaultScanRootsJson = defaultScanRootsJson; }

    public List<String> getDefaultScanRoots() {
        try {
            return MAPPER.readValue(defaultScanRootsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return java.util.List.of("C:\\Users");
        }
    }

    public void setDefaultScanRoots(List<String> defaultScanRoots) {
        try {
            this.defaultScanRootsJson = MAPPER.writeValueAsString(defaultScanRoots);
        } catch (Exception e) {
            this.defaultScanRootsJson = "[\"C:\\\\Users\"]";
        }
    }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public boolean isCreateRestorePointByDefault() { return createRestorePointByDefault; }
    public void setCreateRestorePointByDefault(boolean createRestorePointByDefault) { this.createRestorePointByDefault = createRestorePointByDefault; }
}