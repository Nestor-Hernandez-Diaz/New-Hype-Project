package com.newhype.backend.dto.caja;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoCajaResponse {

    private Long id;
    private Long sesionCajaId;
    private String tipo;
    private BigDecimal monto;
    private String motivo;
    private String descripcion;
    private Long usuarioId;
    private LocalDateTime createdAt;
}
