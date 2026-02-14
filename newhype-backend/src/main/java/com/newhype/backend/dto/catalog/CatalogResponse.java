package com.newhype.backend.dto.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CatalogResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String slug;
    private String descripcion;
    private String codigoHex;
    private String logoUrl;
    private Integer ordenVisualizacion;
    private String simbolo;
    private Boolean estado;
    private LocalDateTime createdAt;
}
