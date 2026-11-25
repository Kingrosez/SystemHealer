package com.systemhealer.api;

/**
 * Response DTO for the /api/system/info endpoint.
 * Mirrors the structure defined in API contract 4.2.
 */
public class SystemInfo {

    private String os;
    private String build;
    private String cpu;
    private int ramGb;
    private boolean isAdmin;
    private boolean bitLockerEnabled;
    private boolean wingetAvailable;

    public SystemInfo() {}

    public SystemInfo(String os, String build, String cpu, int ramGb, boolean isAdmin, boolean bitLockerEnabled, boolean wingetAvailable) {
        this.os = os;
        this.build = build;
        this.cpu = cpu;
        this.ramGb = ramGb;
        this.isAdmin = isAdmin;
        this.bitLockerEnabled = bitLockerEnabled;
        this.wingetAvailable = wingetAvailable;
    }

    public String getOs() { return os; }
    public void setOs(String os) { this.os = os; }

    public String getBuild() { return build; }
    public void setBuild(String build) { this.build = build; }

    public String getCpu() { return cpu; }
    public void setCpu(String cpu) { this.cpu = cpu; }

    public int getRamGb() { return ramGb; }
    public void setRamGb(int ramGb) { this.ramGb = ramGb; }

    public boolean isAdmin() { return isAdmin; }
    public void setAdmin(boolean admin) { isAdmin = admin; }

    public boolean isBitLockerEnabled() { return bitLockerEnabled; }
    public void setBitLockerEnabled(boolean bitLockerEnabled) { bitLockerEnabled = bitLockerEnabled; }

    public boolean isWingetAvailable() { return wingetAvailable; }
    public void setWingetAvailable(boolean wingetAvailable) { wingetAvailable = wingetAvailable; }
}