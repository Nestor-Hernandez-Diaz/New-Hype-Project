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
public class ConfirmarPagoRequest {

    @NotNull(message = "El monto recibido es obligatorio")
    private BigDecimal montoRecibido;

    @NotEmpty(message = "Debe incluir al menos un pago")
    @Valid
    private List<PagoItem> pagos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagoItem {

        @NotNull(message = "El método de pago es obligatorio")
        private Long metodoPagoId;

        @NotNull(message = "El monto es obligatorio")
        private BigDecimal monto;

        private String referencia;
    }
}
