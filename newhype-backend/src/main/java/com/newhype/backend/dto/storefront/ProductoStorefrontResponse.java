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
    private String categoriaNombre;
    private String categoriaSlug;
    private String tallaNombre;
    private String colorNombre;
    private String marcaNombre;
    private String materialNombre;
    private String generoNombre;
    private String imagenUrl;
    private BigDecimal precioVenta;
    private Boolean enLiquidacion;
    private BigDecimal porcentajeLiquidacion;
    private BigDecimal precioLiquidacion;
    private Boolean disponible;
    private List<String> imagenes;
}
