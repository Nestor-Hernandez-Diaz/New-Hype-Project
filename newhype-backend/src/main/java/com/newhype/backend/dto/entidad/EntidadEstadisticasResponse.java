package com.newhype.backend.dto.entidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntidadEstadisticasResponse {

    private long totalClientes;
    private long totalProveedores;
    private long totalAmbos;
    private long totalActivos;
    private long registradosMes;
}
