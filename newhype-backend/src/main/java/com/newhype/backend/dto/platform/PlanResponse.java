package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlanResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precioMensual;
    private BigDecimal precioAnual;
    private Integer maxProductos;
    private Integer maxUsuarios;
    private Integer maxAlmacenes;
    private Integer maxVentasMes;
    private Integer periodoPruebaDias;
    private Boolean estado;
    private Long cantidadTenants;
    private List<ModuloResponse> modulos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
