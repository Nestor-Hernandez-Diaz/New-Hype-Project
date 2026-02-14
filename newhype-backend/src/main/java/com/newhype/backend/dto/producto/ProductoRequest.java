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

    private Long categoriaId;
    private Long tallaId;
    private Long colorId;
    private Long marcaId;
    private Long materialId;
    private Long generoId;
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
