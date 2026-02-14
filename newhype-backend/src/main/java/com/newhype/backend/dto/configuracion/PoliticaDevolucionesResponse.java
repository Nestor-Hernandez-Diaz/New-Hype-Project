package com.newhype.backend.dto.configuracion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PoliticaDevolucionesResponse {

    private Integer diasDevolucionBoleta;
    private Integer diasDevolucionFactura;
    private Boolean requiereEtiquetasOriginales;
    private Boolean requiereProductoSinUso;
    private Integer diasVigenciaVale;
}
