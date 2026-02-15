package com.newhype.backend.dto.storefront;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearPedidoRequest {

    @NotEmpty(message = "El pedido debe tener al menos un producto")
    @Valid
    private List<ItemPedido> items;

    private String direccionEnvio;
    private String instrucciones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemPedido {

        @NotNull(message = "El productoId es obligatorio")
        private Long productoId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        private Integer cantidad;
    }
}
