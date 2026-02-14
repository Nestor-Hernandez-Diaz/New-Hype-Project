package com.newhype.backend.dto.venta;

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
public class PagoVentaResponse {

    private Long id;
    private Long metodoPagoId;
    private BigDecimal monto;
    private String referencia;
    private String observaciones;
    private Integer orden;
    private LocalDateTime createdAt;
}
