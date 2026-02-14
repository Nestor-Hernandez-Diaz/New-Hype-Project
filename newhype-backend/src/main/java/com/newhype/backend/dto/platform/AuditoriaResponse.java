package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditoriaResponse {

    private Long id;
    private Long usuarioPlataformaId;
    private String nombreUsuario;
    private Long tenantId;
    private String tenantNombre;
    private String accion;
    private String detalle;
    private String ipAddress;
    private LocalDateTime createdAt;
}
