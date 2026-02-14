package com.newhype.backend.dto.platform;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearCuponRequest {

    @NotBlank(message = "El código es obligatorio")
    @Size(max = 50)
    private String codigo;

    @NotBlank(message = "El tipo de descuento es obligatorio")
    private String tipoDescuento;

    @NotNull(message = "El valor del descuento es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal valorDescuento;

    private LocalDate fechaExpiracion;

    private Integer usosMaximos;
}
