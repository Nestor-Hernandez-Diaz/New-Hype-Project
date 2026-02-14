package com.newhype.backend.dto.notacredito;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearNotaCreditoRequest {

    @NotNull(message = "La venta origen es obligatoria")
    private Long ventaOrigenId;

    @NotBlank(message = "La serie es obligatoria")
    private String serie;

    @NotBlank(message = "El número es obligatorio")
    private String numero;

    @NotBlank(message = "El motivo SUNAT es obligatorio")
    private String motivoSunat;

    @NotBlank(message = "El tipo es obligatorio")
    private String tipo; // ANULACION, DESCUENTO, DEVOLUCION, CORRECCION

    private String descripcion;
    private String metodoDevolucion; // EFECTIVO, TRANSFERENCIA, VALE

    @NotEmpty(message = "Debe incluir al menos un producto a devolver")
    @Valid
    private List<ItemDevolucion> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDevolucion {

        @NotNull(message = "El detalle de venta es obligatorio")
        private Long detalleVentaId;

        @NotNull(message = "El producto es obligatorio")
        private Long productoId;

        @NotNull(message = "La cantidad es obligatoria")
        private Integer cantidad;
    }
}
