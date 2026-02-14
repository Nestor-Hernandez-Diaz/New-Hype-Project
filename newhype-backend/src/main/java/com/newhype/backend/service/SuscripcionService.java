package com.newhype.backend.service;

import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class SuscripcionService {

    private final SuscripcionRepository suscripcionRepository;
    private final TenantRepository tenantRepository;
    private final PlanSuscripcionRepository planRepository;
    private final AuditoriaPlataformaService auditoriaService;

    public SuscripcionService(SuscripcionRepository suscripcionRepository,
                               TenantRepository tenantRepository,
                               PlanSuscripcionRepository planRepository,
                               AuditoriaPlataformaService auditoriaService) {
        this.suscripcionRepository = suscripcionRepository;
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.auditoriaService = auditoriaService;
    }

    // ── POST /platform/tenants/{id}/suscripcion ──
    @Transactional
    public SuscripcionResponse asignarPlan(Long tenantId, AsignarPlanRequest request, HttpServletRequest httpRequest) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        PlanSuscripcion plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan", request.getPlanId()));

        // Cancel existing active subscription
        suscripcionRepository.findByTenantIdAndEstado(tenantId, Suscripcion.EstadoSuscripcion.ACTIVA)
                .ifPresent(existing -> {
                    existing.setEstado(Suscripcion.EstadoSuscripcion.CANCELADA);
                    suscripcionRepository.save(existing);
                });

        LocalDate fechaInicio = request.getFechaInicio() != null ? request.getFechaInicio() : LocalDate.now();
        LocalDate fechaFin = request.getFechaFin() != null ? request.getFechaFin() : fechaInicio.plusMonths(1);

        Suscripcion suscripcion = Suscripcion.builder()
                .tenantId(tenantId)
                .planId(plan.getId())
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .autoRenovar(request.getAutoRenovar() != null ? request.getAutoRenovar() : true)
                .build();
        suscripcion = suscripcionRepository.save(suscripcion);

        auditoriaService.registrar("ASIGNAR_PLAN",
                "Plan '" + plan.getNombre() + "' asignado a tenant '" + tenant.getNombre() + "'",
                tenantId, httpRequest);

        return toResponse(suscripcion, plan.getNombre());
    }

    // ── GET /platform/suscripciones/estado-pagos ──
    @Transactional(readOnly = true)
    public EstadoPagosResponse obtenerEstadoPagos() {
        LocalDate hoy = LocalDate.now();
        LocalDate en7Dias = hoy.plusDays(7);

        long totalActivas = suscripcionRepository.findByEstado(Suscripcion.EstadoSuscripcion.ACTIVA).size();
        long porVencer = suscripcionRepository.findActivasProximasAVencer(hoy, en7Dias).size();
        long vencidas = suscripcionRepository.findActivasVencidas(hoy).size();
        long alDia = totalActivas - porVencer - vencidas;
        if (alDia < 0) alDia = 0;

        return EstadoPagosResponse.builder()
                .totalSuscripciones(totalActivas)
                .alDia(alDia)
                .porVencer(porVencer)
                .vencidas(vencidas)
                .build();
    }

    // ── POST /platform/tenants/{id}/recordatorio-pago ──
    @Transactional
    public String enviarRecordatorio(Long tenantId, HttpServletRequest httpRequest) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        Suscripcion suscripcion = suscripcionRepository.findFirstByTenantIdOrderByCreatedAtDesc(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("El tenant no tiene suscripción"));

        // In a real system, this would send an email
        String mensaje = "Recordatorio enviado a " + tenant.getEmail() +
                " - Suscripción vence el " + suscripcion.getFechaFin();

        auditoriaService.registrar("ENVIAR_RECORDATORIO_PAGO", mensaje, tenantId, httpRequest);

        return mensaje;
    }

    private SuscripcionResponse toResponse(Suscripcion s, String planNombre) {
        return SuscripcionResponse.builder()
                .id(s.getId())
                .tenantId(s.getTenantId())
                .planId(s.getPlanId())
                .planNombre(planNombre)
                .fechaInicio(s.getFechaInicio())
                .fechaFin(s.getFechaFin())
                .estado(s.getEstado() != null ? s.getEstado().name() : null)
                .autoRenovar(s.getAutoRenovar())
                .overrideMaxProductos(s.getOverrideMaxProductos())
                .overrideMaxUsuarios(s.getOverrideMaxUsuarios())
                .overrideMaxAlmacenes(s.getOverrideMaxAlmacenes())
                .overrideMaxVentasMes(s.getOverrideMaxVentasMes())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
