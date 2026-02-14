package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SuscripcionResponse {

    private Long id;
    private Long tenantId;
    private Long planId;
    private String planNombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private Boolean autoRenovar;
    private Integer overrideMaxProductos;
    private Integer overrideMaxUsuarios;
    private Integer overrideMaxAlmacenes;
    private Integer overrideMaxVentasMes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
