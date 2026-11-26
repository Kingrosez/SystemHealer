package com.systemhealer.api;

/**
 * Request body for uninstalling a program.
 */
public class UninstallRequest {
    private boolean force = false;

    public UninstallRequest() {}

    public boolean isForce() { return force; }
    public void setForce(boolean force) { this.force = force; }
}