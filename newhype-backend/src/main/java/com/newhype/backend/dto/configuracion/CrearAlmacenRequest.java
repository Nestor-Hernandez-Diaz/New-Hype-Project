package com.newhype.backend.dto.configuracion;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearAlmacenRequest {

    @NotBlank(message = "El código es obligatorio")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String ubicacion;
    private Integer capacidad;
}
