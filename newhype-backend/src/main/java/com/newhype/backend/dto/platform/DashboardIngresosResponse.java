package com.newhype.backend.dto.platform;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardIngresosResponse {

    private BigDecimal ingresosMesActual;
    private BigDecimal ingresosMesAnterior;
    private BigDecimal porcentajeCrecimiento;
    private Long totalTenants;
    private Long tenantsActivos;
    private Long tenantsSuspendidos;
    private List<IngresosPorPlan> ingresosPorPlan;
    private List<TopTenant> topTenants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngresosPorPlan {
        private Long planId;
        private String planNombre;
        private BigDecimal ingresos;
        private Long cantidadTenants;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopTenant {
        private Long tenantId;
        private String tenantNombre;
        private BigDecimal totalPagado;
    }
}
