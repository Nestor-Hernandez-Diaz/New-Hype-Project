package com.newhype.backend.dto.venta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearVentaRequest {

    private Long sesionCajaId;
    private Long clienteId;

    @NotNull(message = "El almacén es obligatorio")
    private Long almacenId;

    private String tipoComprobante; // BOLETA, FACTURA, NOTA_VENTA
    private String serie;
    private String numero;
    private String observaciones;

    @NotEmpty(message = "Debe incluir al menos un producto")
    @Valid
    private List<ItemVenta> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemVenta {

        @NotNull(message = "El producto es obligatorio")
        private Long productoId;

        @NotNull(message = "La cantidad es obligatoria")
        private Integer cantidad;

        @NotNull(message = "El precio unitario es obligatorio")
        private BigDecimal precioUnitario;

        private BigDecimal descuento;
    }
}
