package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EstadoPagosResponse {

    private Long totalSuscripciones;
    private Long alDia;
    private Long porVencer;
    private Long vencidas;
}
