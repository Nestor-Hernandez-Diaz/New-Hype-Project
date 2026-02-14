package com.newhype.backend.dto.configuracion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearSerieComprobanteRequest {

    @NotBlank(message = "El tipo de comprobante es obligatorio")
    private String tipoComprobante; // BOLETA, FACTURA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION

    @NotBlank(message = "La serie es obligatoria")
    @Size(min = 4, max = 4, message = "La serie debe tener exactamente 4 caracteres")
    private String serie;

    private Integer numeroInicio;
    private Integer numeroFin;
    private String puntoEmision;
}
