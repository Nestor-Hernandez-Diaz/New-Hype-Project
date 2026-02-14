package com.newhype.backend.dto.configuracion;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearMetodoPagoRequest {

    @NotBlank(message = "El código es obligatorio")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotBlank(message = "El tipo es obligatorio")
    private String tipo; // EFECTIVO, TARJETA, TRANSFERENCIA, DIGITAL

    private Boolean requiereReferencia;
    private Boolean predeterminado;
}
