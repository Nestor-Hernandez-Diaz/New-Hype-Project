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
public class ReporteComprasResponse {

    private long totalOrdenes;
    private BigDecimal montoTotal;
    private long ordenesPendientes;
    private long ordenesCompletadas;

    private List<CompraPorProveedor> porProveedor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompraPorProveedor {
        private Long proveedorId;
        private String proveedorNombre;
        private long cantidadOrdenes;
        private BigDecimal montoTotal;
    }
}
