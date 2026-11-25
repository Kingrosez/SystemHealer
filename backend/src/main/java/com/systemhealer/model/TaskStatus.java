package com.systemhealer.model;

public enum TaskStatus {
    PENDING,
    RUNNING,
    SUCCESS,
    FAILED,
    CANCELLED;

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}