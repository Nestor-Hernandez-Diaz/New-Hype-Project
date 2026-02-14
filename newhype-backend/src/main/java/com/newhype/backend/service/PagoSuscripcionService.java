package com.newhype.backend.service;

import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PagoSuscripcionService {

    private final PagoSuscripcionRepository pagoRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final TenantRepository tenantRepository;
    private final PlanSuscripcionRepository planRepository;
    private final CuponRepository cuponRepository;
    private final AuditoriaPlataformaService auditoriaService;

    public PagoSuscripcionService(PagoSuscripcionRepository pagoRepository,
                                    SuscripcionRepository suscripcionRepository,
                                    TenantRepository tenantRepository,
                                    PlanSuscripcionRepository planRepository,
                                    CuponRepository cuponRepository,
                                    AuditoriaPlataformaService auditoriaService) {
        this.pagoRepository = pagoRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.tenantRepository = tenantRepository;
        this.planRepository = planRepository;
        this.cuponRepository = cuponRepository;
        this.auditoriaService = auditoriaService;
    }

    // ── POST /platform/pagos ──
    @Transactional
    public PagoResponse registrarPago(RegistrarPagoRequest request, HttpServletRequest httpRequest) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", request.getTenantId()));

        Suscripcion suscripcion = suscripcionRepository.findFirstByTenantIdOrderByCreatedAtDesc(request.getTenantId())
                .orElseThrow(() -> new IllegalArgumentException("El tenant no tiene suscripción activa"));

        BigDecimal descuento = BigDecimal.ZERO;
        Long cuponId = null;
        String cuponCodigo = null;

        // Apply coupon if provided
        if (request.getCuponCodigo() != null && !request.getCuponCodigo().isBlank()) {
            Cupon cupon = cuponRepository.findByCodigo(request.getCuponCodigo())
                    .orElseThrow(() -> new IllegalArgumentException("Cupón no encontrado"));

            if (!cupon.getEstado()) {
                throw new IllegalArgumentException("Cupón inactivo");
            }
            if (cupon.getFechaExpiracion() != null && cupon.getFechaExpiracion().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Cupón expirado");
            }
            if (cupon.getUsosMaximos() > 0 && cupon.getUsosActuales() >= cupon.getUsosMaximos()) {
                throw new IllegalArgumentException("Cupón sin usos disponibles");
            }

            if (cupon.getTipoDescuento() == Cupon.TipoDescuento.PORCENTAJE) {
                descuento = request.getMonto().multiply(cupon.getValorDescuento())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                descuento = cupon.getValorDescuento();
            }

            cupon.setUsosActuales(cupon.getUsosActuales() + 1);
            cuponRepository.save(cupon);
            cuponId = cupon.getId();
            cuponCodigo = cupon.getCodigo();
        }

        BigDecimal montoFinal = request.getMonto().subtract(descuento);
        if (montoFinal.compareTo(BigDecimal.ZERO) < 0) montoFinal = BigDecimal.ZERO;

        LocalDate periodoInicio = suscripcion.getFechaFin().isBefore(LocalDate.now())
                ? LocalDate.now() : suscripcion.getFechaFin();
        LocalDate periodoFin = periodoInicio.plusMonths(1);

        PagoSuscripcion pago = PagoSuscripcion.builder()
                .suscripcionId(suscripcion.getId())
                .tenantId(request.getTenantId())
                .monto(montoFinal)
                .metodoPago(request.getMetodoPago())
                .referenciaTransaccion(request.getReferenciaTransaccion())
                .fechaPago(LocalDateTime.now())
                .periodoInicio(periodoInicio)
                .periodoFin(periodoFin)
                .cuponId(cuponId)
                .descuentoAplicado(descuento)
                .estado(PagoSuscripcion.EstadoPago.CONFIRMADO)
                .build();
        pago = pagoRepository.save(pago);

        // Extend subscription
        suscripcion.setFechaFin(periodoFin);
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.ACTIVA);
        suscripcionRepository.save(suscripcion);

        auditoriaService.registrar("REGISTRAR_PAGO",
                "Pago de " + montoFinal + " registrado para tenant '" + tenant.getNombre() + "'",
                request.getTenantId(), httpRequest);

        return toPagoResponse(pago, tenant.getNombre(), cuponCodigo);
    }

    // ── GET /platform/pagos/{id}/factura ──
    @Transactional(readOnly = true)
    public PagoResponse obtenerFactura(Long pagoId) {
        PagoSuscripcion pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pago", pagoId));

        Tenant tenant = tenantRepository.findById(pago.getTenantId()).orElse(null);
        String cuponCodigo = null;
        if (pago.getCuponId() != null) {
            cuponCodigo = cuponRepository.findById(pago.getCuponId()).map(Cupon::getCodigo).orElse(null);
        }

        return toPagoResponse(pago, tenant != null ? tenant.getNombre() : null, cuponCodigo);
    }

    // ── GET /platform/tenants/{id}/pagos ──
    @Transactional(readOnly = true)
    public List<PagoResponse> historialPagos(Long tenantId) {
        tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        return pagoRepository.findByTenantIdOrderByFechaPagoDesc(tenantId).stream()
                .map(p -> {
                    String cuponCodigo = null;
                    if (p.getCuponId() != null) {
                        cuponCodigo = cuponRepository.findById(p.getCuponId())
                                .map(Cupon::getCodigo).orElse(null);
                    }
                    return toPagoResponse(p, tenant != null ? tenant.getNombre() : null, cuponCodigo);
                })
                .collect(Collectors.toList());
    }

    // ── GET /platform/dashboard/ingresos ──
    @Transactional(readOnly = true)
    public DashboardIngresosResponse obtenerDashboardIngresos() {
        YearMonth mesActual = YearMonth.now();
        YearMonth mesAnterior = mesActual.minusMonths(1);

        LocalDateTime inicioMesActual = mesActual.atDay(1).atStartOfDay();
        LocalDateTime finMesActual = mesActual.atEndOfMonth().atTime(23, 59, 59);
        LocalDateTime inicioMesAnterior = mesAnterior.atDay(1).atStartOfDay();
        LocalDateTime finMesAnterior = mesAnterior.atEndOfMonth().atTime(23, 59, 59);

        BigDecimal ingresosMesActual = pagoRepository.sumarIngresosPorPeriodo(inicioMesActual, finMesActual);
        BigDecimal ingresosMesAnterior = pagoRepository.sumarIngresosPorPeriodo(inicioMesAnterior, finMesAnterior);

        BigDecimal porcentajeCrecimiento = BigDecimal.ZERO;
        if (ingresosMesAnterior.compareTo(BigDecimal.ZERO) > 0) {
            porcentajeCrecimiento = ingresosMesActual.subtract(ingresosMesAnterior)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(ingresosMesAnterior, 2, RoundingMode.HALF_UP);
        }

        long totalTenants = tenantRepository.count();
        long tenantsActivos = tenantRepository.countByEstado(Tenant.EstadoTenant.ACTIVA);
        long tenantsSuspendidos = tenantRepository.countByEstado(Tenant.EstadoTenant.SUSPENDIDA);

        // Ingresos por plan
        List<PlanSuscripcion> planes = planRepository.findAllByOrderByCreatedAtDesc();
        List<DashboardIngresosResponse.IngresosPorPlan> ingresosPorPlan = planes.stream().map(plan -> {
            BigDecimal ingresos = pagoRepository.sumarIngresosPorPlan(plan.getId(), inicioMesActual, finMesActual);
            long cantTenants = suscripcionRepository.countByPlanId(plan.getId());
            return DashboardIngresosResponse.IngresosPorPlan.builder()
                    .planId(plan.getId())
                    .planNombre(plan.getNombre())
                    .ingresos(ingresos)
                    .cantidadTenants(cantTenants)
                    .build();
        }).collect(Collectors.toList());

        return DashboardIngresosResponse.builder()
                .ingresosMesActual(ingresosMesActual)
                .ingresosMesAnterior(ingresosMesAnterior)
                .porcentajeCrecimiento(porcentajeCrecimiento)
                .totalTenants(totalTenants)
                .tenantsActivos(tenantsActivos)
                .tenantsSuspendidos(tenantsSuspendidos)
                .ingresosPorPlan(ingresosPorPlan)
                .topTenants(new ArrayList<>())
                .build();
    }

    private PagoResponse toPagoResponse(PagoSuscripcion pago, String tenantNombre, String cuponCodigo) {
        return PagoResponse.builder()
                .id(pago.getId())
                .suscripcionId(pago.getSuscripcionId())
                .tenantId(pago.getTenantId())
                .tenantNombre(tenantNombre)
                .monto(pago.getMonto())
                .metodoPago(pago.getMetodoPago())
                .referenciaTransaccion(pago.getReferenciaTransaccion())
                .fechaPago(pago.getFechaPago())
                .periodoInicio(pago.getPeriodoInicio())
                .periodoFin(pago.getPeriodoFin())
                .cuponId(pago.getCuponId())
                .cuponCodigo(cuponCodigo)
                .descuentoAplicado(pago.getDescuentoAplicado())
                .estado(pago.getEstado() != null ? pago.getEstado().name() : null)
                .createdAt(pago.getCreatedAt())
                .build();
    }
}
