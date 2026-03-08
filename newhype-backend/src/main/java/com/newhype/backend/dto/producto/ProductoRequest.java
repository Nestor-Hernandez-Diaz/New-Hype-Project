package com.newhype.backend.dto.producto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoRequest {

    @NotBlank(message = "El SKU es obligatorio")
    @Size(max = 50)
    private String sku;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 200)
    private String nombre;

    private String descripcion;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @NotNull(message = "La talla es obligatoria")
    private Long tallaId;

    @NotNull(message = "El color es obligatorio")
    private Long colorId;

    @NotNull(message = "La marca es obligatoria")
    private Long marcaId;

    @NotNull(message = "El material es obligatorio")
    private Long materialId;

    @NotNull(message = "El género es obligatorio")
    private Long generoId;

    @NotNull(message = "La unidad de medida es obligatoria")
    private Long unidadMedidaId;

    @Size(max = 20)
    private String codigoBarras;

    @Size(max = 500)
    private String imagenUrl;

    @NotNull(message = "El precio de costo es obligatorio")
    private BigDecimal precioCosto;

    @NotNull(message = "El precio de venta es obligatorio")
    private BigDecimal precioVenta;

    private Integer stockMinimo;
    private Boolean controlaInventario;
}
