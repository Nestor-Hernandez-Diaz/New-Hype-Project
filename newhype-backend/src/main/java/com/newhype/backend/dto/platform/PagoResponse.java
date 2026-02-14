package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PagoResponse {

    private Long id;
    private Long suscripcionId;
    private Long tenantId;
    private String tenantNombre;
    private BigDecimal monto;
    private String metodoPago;
    private String referenciaTransaccion;
    private LocalDateTime fechaPago;
    private LocalDate periodoInicio;
    private LocalDate periodoFin;
    private Long cuponId;
    private String cuponCodigo;
    private BigDecimal descuentoAplicado;
    private String estado;
    private LocalDateTime createdAt;
}
