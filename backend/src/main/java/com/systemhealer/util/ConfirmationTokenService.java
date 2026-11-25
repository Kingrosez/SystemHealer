package com.systemhealer.util;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.Optional;

@Service
public class ConfirmationTokenService {

    private final Map<String, String> tokenMap = new ConcurrentHashMap<>();
    private static final long TTL_MINUTES = 5;

    /**
     * Generate and store a confirmation token for a destructive operation.
     *
     * @param taskId the task identifier
     * @return the generated token
     */
    public String generateToken(String taskId) {
        String token = "tok_" + taskId + "_" + System.currentTimeMillis();
        tokenMap.put(token, taskId);
        return token;
    }

    /**
     * Validate that a confirmation token exists and is still valid.
     *
     * @param token the confirmation token to validate
     * @return the associated taskId if valid, empty otherwise
     */
    public Optional<String> validateToken(String token) {
        String taskId = tokenMap.get(token);
        if (taskId == null) {
            return Optional.empty();
        }
        // Check expiry
        long storedTime = extractTimestamp(token);
        long now = System.currentTimeMillis();
        if (now - storedTime > TimeUnit.MINUTES.toMillis(TTL_MINUTES)) {
            tokenMap.remove(token);
            return Optional.empty();
        }
        return Optional.of(taskId);
    }

    /**
     * Remove a token after it has been used (single-use).
     *
     * @param token the token to remove
     */
    public void consumeToken(String token) {
        tokenMap.remove(token);
    }

    private long extractTimestamp(String token) {
        // Token format: tok_taskId_timestamp
        String[] parts = token.split("_");
        if (parts.length >= 3) {
            try {
                return Long.parseLong(parts[2]);
            } catch (NumberFormatException e) {
                return 0L;
            }
        }
        return 0L;
    }
}