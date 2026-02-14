package com.newhype.backend.dto.compra;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CrearOrdenCompraRequest {

    @NotNull(message = "proveedorId es requerido")
    private Long proveedorId;

    @NotNull(message = "almacenDestinoId es requerido")
    private Long almacenDestinoId;

    private LocalDate fechaEntregaEstimada;

    private String condicionesPago;

    private String formaPago;

    private String observaciones;

    @NotEmpty(message = "items es requerido")
    private List<ItemOrdenCompra> items;

    @Data
    public static class ItemOrdenCompra {
        @NotNull(message = "productoId es requerido")
        private Long productoId;

        @NotNull(message = "cantidadOrdenada es requerida")
        private Integer cantidadOrdenada;

        @NotNull(message = "precioUnitario es requerido")
        private BigDecimal precioUnitario;

        private BigDecimal descuento;

        private String observaciones;
    }
}
