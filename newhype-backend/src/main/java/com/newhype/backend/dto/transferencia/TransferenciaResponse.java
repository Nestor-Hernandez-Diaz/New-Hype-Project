package com.newhype.backend.dto.transferencia;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransferenciaResponse {

    private Long id;
    private String codigo;
    private Long almacenOrigenId;
    private String almacenOrigenNombre;
    private Long almacenDestinoId;
    private String almacenDestinoNombre;
    private String motivo;
    private Long solicitadoPorId;
    private Long aprobadoPorId;
    private LocalDateTime fechaAprobacion;
    private String estado;
    private String observaciones;
    private List<DetalleTransferenciaResponse> detalles;
    private LocalDateTime createdAt;
}
