package com.newhype.backend.dto.platform;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrarPagoRequest {

    @NotNull(message = "El tenantId es obligatorio")
    private Long tenantId;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal monto;

    @NotBlank(message = "El método de pago es obligatorio")
    private String metodoPago;

    private String referenciaTransaccion;

    private String cuponCodigo;
}
