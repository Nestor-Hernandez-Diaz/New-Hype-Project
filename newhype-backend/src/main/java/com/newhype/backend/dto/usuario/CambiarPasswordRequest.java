package com.newhype.backend.dto.usuario;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CambiarPasswordRequest {

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "La contraseña debe contener mayúsculas, minúsculas y números")
    private String nuevaPassword;
}
