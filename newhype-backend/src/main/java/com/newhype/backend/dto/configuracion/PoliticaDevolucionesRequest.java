package com.newhype.backend.dto.configuracion;

import lombok.Data;

@Data
public class PoliticaDevolucionesRequest {

    private Integer diasDevolucionBoleta;
    private Integer diasDevolucionFactura;
    private Boolean requiereEtiquetasOriginales;
    private Boolean requiereProductoSinUso;
    private Integer diasVigenciaVale;
}
