package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearPlanRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50)
    private String nombre;

    private String descripcion;

    @NotNull(message = "El precio mensual es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal precioMensual;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal precioAnual;

    private Integer maxProductos;
    private Integer maxUsuarios;
    private Integer maxAlmacenes;
    private Integer maxVentasMes;
    private Integer periodoPruebaDias;

    // Module IDs to include in this plan
    private List<Long> moduloIds;
}
