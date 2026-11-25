package com.systemhealer.exception;

/**
 * Centralized error codes used across the SystemHealer backend.
 * Each code maps to a specific HTTP status and error scenario.
 */
public final class ErrorCodes {

    // General errors
    public static final String VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String ADMIN_REQUIRED = "ADMIN_REQUIRED";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
    public static final String TASK_NOT_FOUND = "TASK_NOT_FOUND";
    public static final String TASK_ALREADY_RUNNING = "TASK_ALREADY_RUNNING";

    // Repair errors
    public static final String REPAIR_SFC_FAILED = "REPAIR_SFC_FAILED";
    public static final String REPAIR_DISM_FAILED = "REPAIR_DISM_FAILED";
    public static final String REPAIR_NETWORK_RESET_FAILED = "REPAIR_NETWORK_RESET_FAILED";
    public static final String REPAIR_PROCESS_FAILED = "REPAIR_PROCESS_FAILED";
    public static final String COMMAND_TIMEOUT = "COMMAND_TIMEOUT";
    public static final String COMMAND_FAILED = "COMMAND_FAILED";

    // Restore point errors
    public static final String RESTORE_POINT_FAILED = "RESTORE_POINT_FAILED";
    public static final String RESTORE_POINT_LIMIT = "RESTORE_POINT_LIMIT";
    public static final String WOULD_DELETE_ALL_COPIES = "WOULD_DELETE_ALL_COPIES";

    // Program/Uninstaller errors
    public static final String PROGRAM_NOT_FOUND = "PROGRAM_NOT_FOUND";
    public static final String UNINSTALL_FAILED = "UNINSTALL_FAILED";
    public static final String FORCE_UNINSTALL_REQUIRED = "FORCE_UNINSTALL_REQUIRED";

    // Cleaner errors
    public static final String CLEANER_ACCESS_DENIED = "CLEANER_ACCESS_DENIED";
    public static final String CLEANER_NO_ITEMS = "CLEANER_NO_ITEMS";

    // Updater errors
    public static final String WINGET_UNAVAILABLE = "WINGET_UNAVAILABLE";
    public static final String UPDATER_EXECUTE_FAILED = "UPDATER_EXECUTE_FAILED";

    // Duplicate finder errors
    public static final String DUPLICATE_ALREADY_SELECTED = "DUPLICATE_ALREADY_SELECTED";

    // Settings errors
    public static final String SETTINGS_VALIDATION_FAILED = "SETTINGS_VALIDATION_FAILED";

    // Confirmation token errors
    public static final String INVALID_CONFIRM_TOKEN = "INVALID_CONFIRM_TOKEN";

    // Recovery errors
    public static final String RECOVERY_BLOCKED_BITLOCKER = "RECOVERY_BLOCKED_BITLOCKER";

    private ErrorCodes() { /* utility class */ }
}