package com.velaris.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ApiError(
        int status,
        String error,
        String message,
        List<String> details,
        LocalDateTime timestamp
) {}