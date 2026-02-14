package com.newhype.backend.dto.platform;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambiarEstadoTenantRequest {

    @NotBlank(message = "El estado es obligatorio (ACTIVA, SUSPENDIDA)")
    private String estado;

    private String motivo;
}
