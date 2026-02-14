package com.newhype.backend.dto.usuario;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UsuarioResponse {

    private Long id;
    private String email;
    private String username;
    private String nombre;
    private String apellido;
    private Long rolId;
    private String rolNombre;
    private String permisos;
    private Boolean estado;
    private LocalDateTime ultimoAcceso;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
