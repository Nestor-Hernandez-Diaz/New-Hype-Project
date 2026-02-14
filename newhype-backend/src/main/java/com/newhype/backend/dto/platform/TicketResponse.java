package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TicketResponse {

    private Long id;
    private Long tenantId;
    private String tenantNombre;
    private Long usuarioPlataformaId;
    private String atendidoPor;
    private String asunto;
    private String descripcion;
    private String prioridad;
    private String estado;
    private String respuesta;
    private LocalDateTime fechaRespuesta;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
