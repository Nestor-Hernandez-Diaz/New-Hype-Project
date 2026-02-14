package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TenantResponse {

    private Long id;
    private String nombre;
    private String subdominio;
    private String propietarioNombre;
    private String propietarioTipoDocumento;
    private String propietarioNumeroDocumento;
    private String email;
    private String telefono;
    private String direccion;
    private String estado;
    private String motivoSuspension;
    private LocalDateTime ultimaActividad;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Detail fields (only in GET by id)
    private String planActual;
    private Long planId;
    private String estadoSuscripcion;
    private Long cantidadUsuarios;
    private Long cantidadProductos;
}
