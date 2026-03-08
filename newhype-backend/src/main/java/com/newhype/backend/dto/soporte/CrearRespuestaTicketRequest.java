package com.newhype.backend.dto.soporte;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearRespuestaTicketRequest {

    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;
}
