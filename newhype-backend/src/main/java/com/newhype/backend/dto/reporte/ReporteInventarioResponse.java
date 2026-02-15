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
public class ReporteInventarioResponse {

    private long totalProductos;
    private long productosConStock;
    private long productosStockBajo;
    private long productosSinStock;
    private BigDecimal valorizacionTotal;

    private List<InventarioPorAlmacen> porAlmacen;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventarioPorAlmacen {
        private Long almacenId;
        private String almacenNombre;
        private long totalItems;
        private long stockBajo;
        private BigDecimal valorizacion;
    }
}
