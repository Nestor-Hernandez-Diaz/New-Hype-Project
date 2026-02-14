package com.newhype.backend.dto.entidad;

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
public class EntidadRequest {

    private String tipoEntidad; // CLIENTE, PROVEEDOR, AMBOS

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Size(max = 10)
    private String tipoDocumento; // DNI, RUC, CE, PASAPORTE

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20)
    private String numeroDocumento;

    @Size(max = 100)
    private String nombres;

    @Size(max = 100)
    private String apellidos;

    @Size(max = 200)
    private String razonSocial;

    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefono;

    private String direccion;

    private Long departamentoId;
    private Long provinciaId;
    private Long distritoId;
}
