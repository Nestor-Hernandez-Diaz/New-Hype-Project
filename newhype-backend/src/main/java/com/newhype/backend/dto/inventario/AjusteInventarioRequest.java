package com.newhype.backend.dto.inventario;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteInventarioRequest {

    @NotNull(message = "productoId es requerido")
    private Long productoId;

    @NotNull(message = "almacenId es requerido")
    private Long almacenId;

    @NotBlank(message = "tipo es requerido (AJUSTE_INGRESO o AJUSTE_EGRESO)")
    private String tipo;

    @NotNull(message = "cantidad es requerida")
    @Min(value = 1, message = "cantidad debe ser al menos 1")
    private Integer cantidad;

    private String motivo;

    private String documentoReferencia;
}
