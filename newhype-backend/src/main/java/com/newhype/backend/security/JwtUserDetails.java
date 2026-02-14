package com.newhype.backend.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtUserDetails {

    private Long userId;
    private Long tenantId;
    private String role;
    private String scope;
}
