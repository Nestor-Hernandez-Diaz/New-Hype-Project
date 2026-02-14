package com.newhype.backend.dto.compra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleRecepcionResponse {

    private Long id;
    private Long detalleOrdenCompraId;
    private Long productoId;
    private String productoNombre;
    private Integer cantidadRecibida;
    private Integer cantidadAceptada;
    private Integer cantidadRechazada;
    private String motivoRechazo;
    private String observaciones;
}
