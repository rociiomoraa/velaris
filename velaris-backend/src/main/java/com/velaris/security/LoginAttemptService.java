package com.velaris.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS     = 5;
    private static final long BLOCK_DURATION  = 10 * 60 * 1000L;

    private final Map<String, Integer>  attempts  = new ConcurrentHashMap<>();
    private final Map<String, Long>     blockedAt = new ConcurrentHashMap<>();

    public void loginFailed(String ip) {
        int count = attempts.getOrDefault(ip, 0) + 1;
        attempts.put(ip, count);
        if (count >= MAX_ATTEMPTS) {
            blockedAt.put(ip, System.currentTimeMillis());
        }
    }

    public void loginSucceeded(String ip) {
        attempts.remove(ip);
        blockedAt.remove(ip);
    }

    public boolean isBlocked(String ip) {
        if (!blockedAt.containsKey(ip)) return false;
        long elapsed = System.currentTimeMillis() - blockedAt.get(ip);
        if (elapsed > BLOCK_DURATION) {
            attempts.remove(ip);
            blockedAt.remove(ip);
            return false;
        }
        return true;
    }

    public long remainingSeconds(String ip) {
        if (!blockedAt.containsKey(ip)) return 0;
        long elapsed = System.currentTimeMillis() - blockedAt.get(ip);
        return (BLOCK_DURATION - elapsed) / 1000;
    }
}