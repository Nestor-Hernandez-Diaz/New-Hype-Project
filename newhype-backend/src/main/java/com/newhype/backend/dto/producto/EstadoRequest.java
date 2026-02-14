package com.newhype.backend.dto.producto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadoRequest {

    @NotNull(message = "El estado es obligatorio")
    private Boolean estado;
}
