package com.newhype.backend.dto.storefront;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantPublicResponse {
    private Long id;
    private String nombre;
    private String subdominio;
    private String estado;
}
