package com.systemhealer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.ZonedDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SystemHealerException.class)
    public ResponseEntity<ErrorResponse> handleSystemHealerException(
            SystemHealerException ex,
            WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                ex.getHttpStatus().value(),
                ZonedDateTime.now(),
                ex.getErrorCode(),
                ex.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(error, ex.getHttpStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            WebRequest request) {
        SystemHealerException se = new SystemHealerException(
                "Unexpected error: " + ex.getMessage(),
                "INTERNAL_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR);
        ErrorResponse error = new ErrorResponse(
                se.getHttpStatus().value(),
                ZonedDateTime.now(),
                se.getErrorCode(),
                se.getMessage(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(error, se.getHttpStatus());
    }

    public static class ErrorResponse {
        private final int status;
        private final ZonedDateTime timestamp;
        private final String code;
        private final String message;
        private final String path;

        public ErrorResponse(int status, ZonedDateTime timestamp, String code, String message, String path) {
            this.status = status;
            this.timestamp = timestamp;
            this.code = code;
            this.message = message;
            this.path = path;
        }

        public int getStatus() { return status; }
        public ZonedDateTime getTimestamp() { return timestamp; }
        public String getCode() { return code; }
        public String getMessage() { return message; }
        public String getPath() { return path; }
    }
}