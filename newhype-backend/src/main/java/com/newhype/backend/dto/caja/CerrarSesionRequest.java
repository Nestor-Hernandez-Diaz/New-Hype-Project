package com.newhype.backend.dto.caja;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CerrarSesionRequest {

    @NotNull(message = "El monto de cierre es obligatorio")
    private BigDecimal montoCierre;

    private String observaciones;
}
