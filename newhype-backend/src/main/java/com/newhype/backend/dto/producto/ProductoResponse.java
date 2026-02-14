package com.newhype.backend.dto.producto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductoResponse {

    private Long id;
    private String sku;
    private String nombre;
    private String slug;
    private String descripcion;
    private Long categoriaId;
    private String categoriaNombre;
    private Long tallaId;
    private Long colorId;
    private Long marcaId;
    private Long materialId;
    private Long generoId;
    private Long unidadMedidaId;
    private String codigoBarras;
    private String imagenUrl;
    private BigDecimal precioCosto;
    private BigDecimal precioVenta;
    private Integer stockMinimo;
    private Boolean controlaInventario;
    private Boolean enLiquidacion;
    private BigDecimal porcentajeLiquidacion;
    private Boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
