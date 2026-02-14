package com.newhype.backend.dto.configuracion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConfiguracionEmpresaResponse {

    private Long id;
    private String ruc;
    private String razonSocial;
    private String nombreComercial;
    private String direccion;
    private String telefono;
    private String email;
    private String website;
    private String logoUrl;
    private String departamento;
    private String provincia;
    private String distrito;
    private Boolean igvActivo;
    private BigDecimal igvPorcentaje;
    private String moneda;
    private String sunatUsuario;
    private String sunatServidor;
    // Politica de devoluciones
    private Integer diasDevolucionBoleta;
    private Integer diasDevolucionFactura;
    private Boolean requiereEtiquetasOriginales;
    private Boolean requiereProductoSinUso;
    private Integer diasVigenciaVale;
    private LocalDateTime updatedAt;
}
