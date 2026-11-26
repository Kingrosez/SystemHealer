package com.systemhealer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.ZonedDateTime;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String DEFAULT_USER_MESSAGE =
            "Something went wrong. Please try again.";

    @ExceptionHandler(SystemHealerException.class)
    public ResponseEntity<ErrorResponse> handleSystemHealerException(
            SystemHealerException ex,
            WebRequest request) {
        ErrorResponse error = buildError(
                ex.getHttpStatus(),
                ex.getErrorCode(),
                ex.getMessage(),
                request);
        return new ResponseEntity<>(error, ex.getHttpStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            WebRequest request) {
        SystemHealerException se = new SystemHealerException(
                "Unexpected error: " + ex.getMessage(),
                ErrorCodes.INTERNAL_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR);
        ErrorResponse error = buildError(
                se.getHttpStatus(),
                se.getErrorCode(),
                se.getMessage(),
                request);
        return new ResponseEntity<>(error, se.getHttpStatus());
    }

    private ErrorResponse buildError(
            HttpStatus status,
            String code,
            String message,
            WebRequest request) {
        return new ErrorResponse(
                status.value(),
                ZonedDateTime.now(),
                code,
                message,
                userMessageFor(code),
                requestPath(request),
                newTraceId());
    }

    private String requestPath(WebRequest request) {
        String description = request.getDescription(false);
        if (description.startsWith("uri=")) {
            return description.substring(4);
        }
        return description;
    }

    private String newTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String userMessageFor(String code) {
        switch (code) {
            case ErrorCodes.VALIDATION_FAILED:
            case ErrorCodes.SETTINGS_VALIDATION_FAILED:
                return "The request was invalid. Check the values and try again.";
            case ErrorCodes.ADMIN_REQUIRED:
                return "Administrator permission is required for this action.";
            case ErrorCodes.TASK_NOT_FOUND:
                return "The requested task could not be found.";
            case ErrorCodes.TASK_ALREADY_RUNNING:
                return "Another task is already running. Wait for it to finish and try again.";
            case ErrorCodes.RESTORE_POINT_FAILED:
                return "A restore point could not be created. Check System Protection settings and try again.";
            case ErrorCodes.RESTORE_POINT_LIMIT:
                return "Windows has reached its restore point limit. Try again later.";
            case ErrorCodes.WOULD_DELETE_ALL_COPIES:
                return "At least one copy of each duplicate file must be kept.";
            case ErrorCodes.COMMAND_TIMEOUT:
                return "The system command timed out. Please try again.";
            case ErrorCodes.COMMAND_FAILED:
                return "A system command failed. Check the backend logs for details.";
            case ErrorCodes.WINGET_UNAVAILABLE:
                return "Winget is not available on this system.";
            case ErrorCodes.RECOVERY_BLOCKED_BITLOCKER:
                return "System restore is blocked while BitLocker is enabled. Suspend BitLocker and try again.";
            case ErrorCodes.INVALID_CONFIRM_TOKEN:
                return "This confirmation has expired. Review the operation and try again.";
            case ErrorCodes.PROGRAM_NOT_FOUND:
                return "The selected program could not be found.";
            case ErrorCodes.UNINSTALL_FAILED:
                return "The program could not be uninstalled. Check the backend logs for details.";
            case ErrorCodes.FORCE_UNINSTALL_REQUIRED:
                return "This program requires a forced uninstall. Review the warning and try again.";
            case ErrorCodes.CLEANER_ACCESS_DENIED:
                return "Some files could not be accessed. Run SystemHealer as administrator.";
            case ErrorCodes.CLEANER_NO_ITEMS:
                return "No items were selected for cleaning.";
            case ErrorCodes.UPDATER_EXECUTE_FAILED:
                return "One or more updates could not be installed. Check the backend logs for details.";
            case ErrorCodes.DUPLICATE_ALREADY_SELECTED:
                return "One of the selected files was already scheduled for deletion.";
            case ErrorCodes.REPAIR_SFC_FAILED:
                return "System File Checker could not complete. Try running as administrator.";
            case ErrorCodes.REPAIR_DISM_FAILED:
                return "DISM could not repair the system image. Try running as administrator.";
            case ErrorCodes.REPAIR_NETWORK_RESET_FAILED:
                return "The network reset could not be completed.";
            case ErrorCodes.REPAIR_PROCESS_FAILED:
                return "The repair process failed. Check the backend logs for details.";
            case ErrorCodes.INTERNAL_ERROR:
            default:
                return DEFAULT_USER_MESSAGE;
        }
    }

    public static class ErrorResponse {
        private final int status;
        private final ZonedDateTime timestamp;
        private final String code;
        private final String message;
        private final String userMessage;
        private final String path;
        private final String traceId;

        public ErrorResponse(
                int status,
                ZonedDateTime timestamp,
                String code,
                String message,
                String userMessage,
                String path,
                String traceId) {
            this.status = status;
            this.timestamp = timestamp;
            this.code = code;
            this.message = message;
            this.userMessage = userMessage;
            this.path = path;
            this.traceId = traceId;
        }

        public int getStatus() { return status; }
        public ZonedDateTime getTimestamp() { return timestamp; }
        public String getCode() { return code; }
        public String getMessage() { return message; }
        public String getUserMessage() { return userMessage; }
        public String getPath() { return path; }
        public String getTraceId() { return traceId; }
    }
}
