package com.newhype.backend.dto.storefront;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmpresaStorefrontResponse {

    private String nombreComercial;
    private String razonSocial;
    private String direccion;
    private String telefono;
    private String email;
    private String website;
    private String logoUrl;
    private String departamento;
    private String provincia;
    private String distrito;

    // Politica de devoluciones
    private Integer diasDevolucionBoleta;
    private Integer diasDevolucionFactura;
    private Integer diasVigenciaVale;
    private Boolean requiereEtiquetasOriginales;
    private Boolean requiereProductoSinUso;
}
