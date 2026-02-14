package com.newhype.backend.dto.platform;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarTicketRequest {

    private String estado;
    private String prioridad;
    private String respuesta;
}
