package com.systemhealer.api;

/**
 * Health check response.
 */
public class HealthResponse {
    private String status;
    private String version;
    private String uptimeSeconds;

    public HealthResponse() {}

    public HealthResponse(String status, String version, String uptimeSeconds) {
        this.status = status;
        this.version = version;
        this.uptimeSeconds = uptimeSeconds;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getUptimeSeconds() { return uptimeSeconds; }
    public void setUptimeSeconds(String uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; }
}