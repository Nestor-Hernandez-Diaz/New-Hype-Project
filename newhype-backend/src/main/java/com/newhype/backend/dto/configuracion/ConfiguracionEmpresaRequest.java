package com.newhype.backend.dto.configuracion;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ConfiguracionEmpresaRequest {

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
    private String sunatClave;
    private String sunatServidor; // HOMOLOGACION or PRODUCCION
}
