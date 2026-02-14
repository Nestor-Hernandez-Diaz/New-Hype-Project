package com.newhype.backend.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockResponse {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoSku;
    private Long almacenId;
    private String almacenNombre;
    private Integer cantidad;
    private Integer stockMinimo;
    private Boolean stockBajo;
}
