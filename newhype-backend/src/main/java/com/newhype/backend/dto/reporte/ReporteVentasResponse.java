package com.newhype.backend.dto.reporte;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReporteVentasResponse {

    private long totalVentas;
    private BigDecimal montoTotal;
    private BigDecimal montoIgv;
    private BigDecimal montoDescuentos;
    private BigDecimal ticketPromedio;

    private List<VentaPorDia> ventasPorDia;
    private List<VentaPorTipo> ventasPorTipo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VentaPorDia {
        private String fecha;
        private long cantidad;
        private BigDecimal total;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VentaPorTipo {
        private String tipoComprobante;
        private long cantidad;
        private BigDecimal total;
    }
}
