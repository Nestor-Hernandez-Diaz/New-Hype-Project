package com.newhype.backend.dto.storefront;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarPerfilRequest {

    private String nombre;
    private String apellido;
    private String telefono;
    private String direccion;
}
