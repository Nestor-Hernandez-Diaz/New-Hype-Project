package com.newhype.backend.dto.cotizacion;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvertirCotizacionRequest {

    private Long sesionCajaId;
    private String tipoComprobante; // BOLETA, FACTURA, NOTA_VENTA
    private String serie;
    private String numero;
    private String observaciones;
}
