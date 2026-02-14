package com.newhype.backend.dto.venta;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoVentaRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado; // CANCELADA
}
