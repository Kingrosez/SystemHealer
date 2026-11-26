package com.systemhealer.model;

public enum TaskType {
    REPAIR,
    CLEANER,
    DISK_SCAN,
    DUPLICATE_SCAN,
    UPDATER,
    PROGRAM_UNINSTALL,
    RECOVERY,
    SETTINGS_UPDATE;

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}