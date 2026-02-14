package com.newhype.backend.dto.transferencia;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CrearTransferenciaRequest {

    @NotNull(message = "almacenOrigenId es requerido")
    private Long almacenOrigenId;

    @NotNull(message = "almacenDestinoId es requerido")
    private Long almacenDestinoId;

    private String motivo;

    private String observaciones;

    @NotEmpty(message = "items es requerido")
    private List<ItemTransferencia> items;

    @Data
    public static class ItemTransferencia {
        @NotNull(message = "productoId es requerido")
        private Long productoId;

        @NotNull(message = "cantidad es requerida")
        private Integer cantidad;
    }
}
