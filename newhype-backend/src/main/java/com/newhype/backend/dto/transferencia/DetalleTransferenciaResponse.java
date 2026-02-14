package com.newhype.backend.dto.transferencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleTransferenciaResponse {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
}
