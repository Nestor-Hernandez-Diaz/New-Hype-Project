package com.newhype.backend.dto.reporte;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReporteFinancieroResponse {

    // Ingresos (ventas completadas)
    private BigDecimal totalIngresos;
    private long totalVentas;

    // Egresos (compras completadas)
    private BigDecimal totalEgresos;
    private long totalCompras;

    // Devoluciones (notas de crédito aplicadas)
    private BigDecimal totalDevoluciones;
    private long totalNotasCredito;

    // Balance
    private BigDecimal balanceNeto;
    private BigDecimal margenBruto;
}
