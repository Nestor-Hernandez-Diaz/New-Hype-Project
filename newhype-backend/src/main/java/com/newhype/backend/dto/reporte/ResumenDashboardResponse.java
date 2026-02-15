package com.newhype.backend.dto.reporte;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResumenDashboardResponse {

    // Ventas hoy
    private long ventasHoy;
    private BigDecimal totalVentasHoy;

    // Ventas este mes
    private long ventasMes;
    private BigDecimal totalVentasMes;

    // Stock bajo
    private long productosStockBajo;

    // Compras pendientes
    private long comprasPendientes;

    // Notas de crédito este mes
    private long notasCreditoMes;
    private BigDecimal totalNotasCreditoMes;

    // Productos activos
    private long productosActivos;

    // Clientes registrados
    private long clientesRegistrados;
}
