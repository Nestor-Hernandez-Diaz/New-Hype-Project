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
public class ProductosMasVendidosResponse {

    private long totalProductosVendidos;
    private List<ProductoVendido> productos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductoVendido {
        private Long productoId;
        private String sku;
        private String nombre;
        private String categoriaNombre;
        private long cantidadVendida;
        private BigDecimal montoTotal;
    }
}
