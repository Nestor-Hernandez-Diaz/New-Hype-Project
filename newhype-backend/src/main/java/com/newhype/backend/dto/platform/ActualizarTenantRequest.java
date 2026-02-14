package com.newhype.backend.dto.platform;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarTenantRequest {

    @Size(max = 150)
    private String nombre;

    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefono;

    private String direccion;

    // Override limits (null = use plan defaults)
    private Integer overrideMaxProductos;
    private Integer overrideMaxUsuarios;
    private Integer overrideMaxAlmacenes;
    private Integer overrideMaxVentasMes;
}
