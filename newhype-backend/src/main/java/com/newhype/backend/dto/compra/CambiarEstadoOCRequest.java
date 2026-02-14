package com.newhype.backend.dto.compra;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarEstadoOCRequest {

    @NotBlank(message = "estado es requerido")
    private String estado;
}
