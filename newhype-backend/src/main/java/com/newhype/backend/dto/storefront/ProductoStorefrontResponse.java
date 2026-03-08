package com.newhype.backend.dto.storefront;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductoStorefrontResponse {

    private Long id;
    private String sku;
    private String nombre;
    private String slug;
    private String descripcion;
    private Long categoriaId;
    private String categoriaNombre;
    private String categoriaSlug;
    private Long marcaId;
    private String marcaNombre;
    private Long materialId;
    private String materialNombre;
    private Long generoId;
    private String generoNombre;
    private Long tallaId;
    private String tallaNombre;
    private Long colorId;
    private String colorNombre;
    private Long unidadMedidaId;
    private String unidadNombre;
    private String imagenUrl;
    private BigDecimal precioVenta;
    private Boolean enLiquidacion;
    private BigDecimal porcentajeLiquidacion;
    private BigDecimal precioLiquidacion;
    private Boolean disponible;
    private Integer stockTotal;
    private List<String> imagenes;
    private List<Long> tallasDisponibles;
    private List<Long> coloresDisponibles;
    private List<VarianteInfo> variantes;
    private String createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VarianteInfo {
        private Long id;
        private String sku;
        private Long tallaId;
        private String tallaNombre;
        private Long colorId;
        private String colorNombre;
        private String colorHex;
        private Integer stock;
        private Boolean disponible;
        private String imagenUrl;
        private List<String> imagenes;
        private BigDecimal precioVenta;
    }
}
