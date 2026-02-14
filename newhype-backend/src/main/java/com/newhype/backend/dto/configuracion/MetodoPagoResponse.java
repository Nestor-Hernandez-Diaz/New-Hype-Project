package com.newhype.backend.dto.configuracion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MetodoPagoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipo;
    private Boolean requiereReferencia;
    private Boolean predeterminado;
    private Boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
