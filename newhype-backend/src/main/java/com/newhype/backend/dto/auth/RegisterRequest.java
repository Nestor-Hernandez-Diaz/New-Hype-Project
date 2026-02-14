package com.newhype.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100)
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "El password es obligatorio")
    @Size(min = 6, max = 100, message = "El password debe tener entre 6 y 100 caracteres")
    private String password;

    @Size(max = 150, message = "El nombre de tienda no debe superar 150 caracteres")
    private String nombreTienda;
}
