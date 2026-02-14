package com.newhype.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, TokenBlacklist tokenBlacklist) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtil.validateToken(token) && !tokenBlacklist.isBlacklisted(token)) {
            String type = jwtUtil.extractType(token);

            // Only accept access tokens, not refresh tokens
            if ("access".equals(type)) {
                Long userId = jwtUtil.extractUserId(token);
                Long tenantId = jwtUtil.extractTenantId(token);
                String role = jwtUtil.extractRole(token);
                String scope = jwtUtil.extractScope(token);

                JwtUserDetails userDetails = JwtUserDetails.builder()
                        .userId(userId)
                        .tenantId(tenantId)
                        .role(role)
                        .scope(scope)
                        .build();

                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER")));

                var authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
