package com.systemhealer.exception;

import org.springframework.http.HttpStatus;

@SuppressWarnings("serial")
public class SystemHealerException extends RuntimeException {
    private final String errorCode;
    private final HttpStatus httpStatus;

    public SystemHealerException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public SystemHealerException(String message, String errorCode, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}