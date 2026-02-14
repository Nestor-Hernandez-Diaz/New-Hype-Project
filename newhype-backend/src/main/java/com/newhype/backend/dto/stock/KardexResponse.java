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
}
