package com.newhype.backend.dto.compra;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CrearRecepcionRequest {

    @NotNull(message = "ordenCompraId es requerido")
    private Long ordenCompraId;

    private String guiaRemision;

    private String observaciones;

    @NotEmpty(message = "items es requerido")
    private List<ItemRecepcion> items;

    @Data
    public static class ItemRecepcion {
        @NotNull(message = "detalleOrdenCompraId es requerido")
        private Long detalleOrdenCompraId;

        @NotNull(message = "productoId es requerido")
        private Long productoId;

        @NotNull(message = "cantidadRecibida es requerida")
        private Integer cantidadRecibida;

        @NotNull(message = "cantidadAceptada es requerida")
        private Integer cantidadAceptada;

        private Integer cantidadRechazada;

        private String motivoRechazo;

        private String observaciones;
    }
}
