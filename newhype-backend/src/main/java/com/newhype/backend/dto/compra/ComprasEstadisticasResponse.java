package com.newhype.backend.dto.compra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComprasEstadisticasResponse {

    private long totalOrdenes;
    private long pendientes;
    private long enviadas;
    private long confirmadas;
    private long enRecepcion;
    private long parciales;
    private long completadas;
    private long canceladas;
    private BigDecimal montoTotalCompletadas;
    private BigDecimal montoTotalPendientes;
}
