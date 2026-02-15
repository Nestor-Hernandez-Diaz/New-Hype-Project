package com.newhype.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class TenantContext {

    private TenantContext() {}

    public static JwtUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtUserDetails) {
            return (JwtUserDetails) auth.getPrincipal();
        }
        return null;
    }

    public static Long getCurrentUserId() {
        JwtUserDetails user = getCurrentUser();
        return user != null ? user.getUserId() : null;
    }

    public static Long getCurrentTenantId() {
        JwtUserDetails user = getCurrentUser();
        return user != null ? user.getTenantId() : null;
    }

    public static String getCurrentRole() {
        JwtUserDetails user = getCurrentUser();
        return user != null ? user.getRole() : null;
    }

    public static String getCurrentScope() {
        JwtUserDetails user = getCurrentUser();
        return user != null ? user.getScope() : null;
    }

    public static boolean isPlatformScope() {
        return "platform".equals(getCurrentScope());
    }

    public static boolean isTenantScope() {
        return "tenant".equals(getCurrentScope());
    }

    public static boolean isStorefrontScope() {
        return "storefront".equals(getCurrentScope());
    }
}
