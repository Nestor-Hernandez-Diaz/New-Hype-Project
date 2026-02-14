package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearTenantRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El subdominio es obligatorio")
    @Size(max = 50)
    private String subdominio;

    @NotBlank(message = "El nombre del propietario es obligatorio")
    @Size(max = 200)
    private String propietarioNombre;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Size(max = 10)
    private String propietarioTipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20)
    private String propietarioNumeroDocumento;

    @NotBlank(message = "El email es obligatorio")
    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefono;

    private String direccion;

    // Plan to assign (optional, creates subscription if provided)
    private Long planId;

    // Initial admin user credentials
    @NotBlank(message = "El password del admin es obligatorio")
    @Size(min = 8, message = "El password debe tener al menos 8 caracteres")
    private String adminPassword;
}
