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
public class CuponResponse {

    private Long id;
    private String codigo;
    private String tipoDescuento;
    private BigDecimal valorDescuento;
    private LocalDate fechaExpiracion;
    private Integer usosMaximos;
    private Integer usosActuales;
    private Boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
