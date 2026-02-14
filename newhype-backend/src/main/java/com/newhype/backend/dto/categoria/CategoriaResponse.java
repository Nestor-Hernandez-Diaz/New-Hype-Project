package com.newhype.backend.dto.categoria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String slug;
    private String descripcion;
    private Boolean estado;
    private LocalDateTime createdAt;
}
