package com.newhype.backend.dto.entidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntidadResponse {

    private Long id;
    private String tipoEntidad;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;
    private String razonSocial;
    private String email;
    private String telefono;
    private String direccion;
    private Long departamentoId;
    private Long provinciaId;
    private Long distritoId;
    private Boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
