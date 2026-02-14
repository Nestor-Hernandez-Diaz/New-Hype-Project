package com.newhype.backend.dto.usuario;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ActualizarUsuarioRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email no válido")
    private String email;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotNull(message = "El rol es obligatorio")
    private Long rolId;
}
