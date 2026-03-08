package com.newhype.backend.dto.storefront;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MetodoPagoStorefrontResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String tipo;
    private Boolean requiereReferencia;
}
