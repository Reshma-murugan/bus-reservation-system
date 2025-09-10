package com.busreservation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccountInactiveException extends AuthenticationException {
    public AccountInactiveException(String message) {
        super(message);
    }

    public AccountInactiveException(String message, Throwable cause) {
        super(message, cause);
    }
}
