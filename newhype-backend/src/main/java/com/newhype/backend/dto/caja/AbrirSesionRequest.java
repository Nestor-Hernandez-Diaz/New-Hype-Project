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
public class AbrirSesionRequest {

    @NotNull(message = "La caja registradora es obligatoria")
    private Long cajaRegistradoraId;

    private BigDecimal montoApertura;
}
