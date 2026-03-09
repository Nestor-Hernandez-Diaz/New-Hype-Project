package com.newhype.backend.dto.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KardexResponse {

    private Long id;
    private String tipo;
    private Integer cantidad;
    private Integer stockAntes;
    private Integer stockDespues;
    private String documentoReferencia;
    private Long almacenId;
    private Long usuarioId;
    private LocalDateTime createdAt;

    // ⭐ NUEVOS CAMPOS PARA ENRIQUECIMIENTO (Sprint Inventario)
    private Long productoId;           // ID del producto
    private String productoNombre;     // Nombre del producto (join)
    private String productoSku;        // SKU del producto (join)
    private String almacenNombre;      // Nombre del almacén (join)
    private String usuarioNombre;      // Nombre del usuario (join)
}
