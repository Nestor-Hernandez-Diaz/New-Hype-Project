package com.newhype.backend.dto.reporte;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReporteCajaResponse {

    private long totalSesiones;
    private BigDecimal totalVentas;
    private BigDecimal totalDiferencias;

    private List<SesionCajaResumen> sesiones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SesionCajaResumen {
        private Long sesionId;
        private Long cajaId;
        private String cajaNombre;
        private Long usuarioId;
        private String usuarioNombre;
        private String fechaApertura;
        private String fechaCierre;
        private BigDecimal montoApertura;
        private BigDecimal montoCierre;
        private BigDecimal totalVentas;
        private BigDecimal diferencia;
        private String estado;
    }
}
