package com.newhype.backend.dto.compra;

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
public class RecepcionCompraResponse {

    private Long id;
    private String codigo;
    private Long ordenCompraId;
    private String ordenCompraCodigo;
    private Long almacenId;
    private String almacenNombre;
    private Long recibidoPorId;
    private LocalDateTime fechaRecepcion;
    private String guiaRemision;
    private Boolean esRecepcionCompleta;
    private String estado;
    private String observaciones;
    private List<DetalleRecepcionResponse> detalles;
    private LocalDateTime createdAt;
}
