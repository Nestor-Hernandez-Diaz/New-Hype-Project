package com.newhype.backend.dto.usuario;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RolResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private String permisos;
    private Boolean esSistema;
    private Boolean estado;
    private Long cantidadUsuarios;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
