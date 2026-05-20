package com.velaris.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final LoginAttemptService loginAttemptService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        if (req.getRequestURI().equals("/api/auth/login") && req.getMethod().equals("POST")) {
            String ip = getClientIp(req);
            if (loginAttemptService.isBlocked(ip)) {
                long remaining = loginAttemptService.remainingSeconds(ip);
                res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                res.setContentType("application/json;charset=UTF-8");
                Map<String, Object> body = Map.of(
                        "status",  403,
                        "error",   "Demasiados intentos",
                        "message", "Tu IP ha sido bloqueada. Inténtalo de nuevo en " + remaining + " segundos."
                );
                res.getWriter().write(mapper.writeValueAsString(body));
                return;
            }
        }
        chain.doFilter(req, res);
    }

    private String getClientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) return xff.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}