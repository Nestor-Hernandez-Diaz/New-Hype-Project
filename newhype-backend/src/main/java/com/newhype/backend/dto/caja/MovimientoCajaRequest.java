package com.newhype.backend.dto.caja;

import jakarta.validation.constraints.NotBlank;
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
public class MovimientoCajaRequest {

    @NotBlank(message = "El tipo es obligatorio (INGRESO o EGRESO)")
    private String tipo;

    @NotNull(message = "El monto es obligatorio")
    private BigDecimal monto;

    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;

    private String descripcion;
}
