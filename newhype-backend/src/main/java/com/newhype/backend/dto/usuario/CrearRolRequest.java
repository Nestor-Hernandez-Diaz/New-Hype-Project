package com.newhype.backend.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearRolRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    private String permisos; // JSON array string, e.g. '["VENTAS_CREAR","INVENTARIO_VER"]'
}
