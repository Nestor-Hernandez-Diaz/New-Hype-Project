package com.newhype.backend.dto.platform;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarModulosTenantRequest {

    @NotEmpty(message = "Debe incluir al menos un módulo")
    private List<ModuloEstado> modulos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModuloEstado {
        private Long moduloId;
        private Boolean activo;
    }
}
