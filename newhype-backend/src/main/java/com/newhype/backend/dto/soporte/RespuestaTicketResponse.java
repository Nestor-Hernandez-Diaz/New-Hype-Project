package com.newhype.backend.dto.soporte;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RespuestaTicketResponse {

    private Long id;
    private Long ticketId;
    private String autorTipo;
    private Long autorId;
    private String autorNombre;
    private String mensaje;
    private LocalDateTime createdAt;
}
