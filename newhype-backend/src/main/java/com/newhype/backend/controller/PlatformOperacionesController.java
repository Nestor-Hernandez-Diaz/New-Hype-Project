package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.platform.*;
import com.newhype.backend.security.TenantContext;
import com.newhype.backend.service.PagoSuscripcionService;
import com.newhype.backend.service.SuscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/platform")
@Tag(name = "Platform - Operaciones", description = "Dashboard, pagos, tickets, auditoría")
public class PlatformOperacionesController {

    private final PagoSuscripcionService pagoService;
    private final SuscripcionService suscripcionService;
    private final com.newhype.backend.service.TicketSoporteService ticketService;
    private final com.newhype.backend.repository.AuditoriaPlataformaRepository auditoriaRepository;
    private final com.newhype.backend.repository.TenantRepository tenantRepository;
    private final com.newhype.backend.repository.UsuarioPlataformaRepository usuarioPlataformaRepository;

    public PlatformOperacionesController(PagoSuscripcionService pagoService,
                                          SuscripcionService suscripcionService,
                                          com.newhype.backend.service.TicketSoporteService ticketService,
                                          com.newhype.backend.repository.AuditoriaPlataformaRepository auditoriaRepository,
                                          com.newhype.backend.repository.TenantRepository tenantRepository,
                                          com.newhype.backend.repository.UsuarioPlataformaRepository usuarioPlataformaRepository) {
        this.pagoService = pagoService;
        this.suscripcionService = suscripcionService;
        this.ticketService = ticketService;
        this.auditoriaRepository = auditoriaRepository;
        this.tenantRepository = tenantRepository;
        this.usuarioPlataformaRepository = usuarioPlataformaRepository;
    }

    private void requirePlatformScope() {
        if (!TenantContext.isPlatformScope()) {
            throw new SecurityException("Acceso denegado: se requiere scope platform");
        }
    }

    // ── Dashboard ──
    @GetMapping("/dashboard/ingresos")
    @Operation(summary = "Dashboard de ingresos: métricas globales, por plan, top tenants")
    public ResponseEntity<ApiResponse<DashboardIngresosResponse>> dashboardIngresos() {
        requirePlatformScope();
        DashboardIngresosResponse response = pagoService.obtenerDashboardIngresos();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ── Estado de pagos de suscripciones ──
    @GetMapping("/suscripciones/estado-pagos")
    @Operation(summary = "Dashboard: al día, por vencer (7d), vencidos")
    public ResponseEntity<ApiResponse<EstadoPagosResponse>> estadoPagos() {
        requirePlatformScope();
        EstadoPagosResponse response = suscripcionService.obtenerEstadoPagos();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ── Pagos ──
    @PostMapping("/pagos")
    @Operation(summary = "Registrar pago manual → extiende fecha_fin +30d")
    public ResponseEntity<ApiResponse<PagoResponse>> registrarPago(
            @Valid @RequestBody RegistrarPagoRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        PagoResponse response = pagoService.registrarPago(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Pago registrado", response));
    }

    @GetMapping("/pagos/{id}/factura")
    @Operation(summary = "Obtener factura/detalle del pago")
    public ResponseEntity<ApiResponse<PagoResponse>> obtenerFactura(@PathVariable Long id) {
        requirePlatformScope();
        PagoResponse response = pagoService.obtenerFactura(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ── Tickets ──
    @GetMapping("/tickets")
    @Operation(summary = "Listar tickets de soporte")
    public ResponseEntity<ApiResponse<java.util.List<TicketResponse>>> listarTickets(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requirePlatformScope();
        var result = ticketService.listar(estado, prioridad, tenantId, page, size);
        return ResponseEntity.ok(ApiResponse.<java.util.List<TicketResponse>>builder()
                .success(true)
                .data(result.getContent())
                .pagination(ApiResponse.PaginationMeta.builder()
                        .page(page)
                        .size(size)
                        .totalElements(result.getTotalElements())
                        .totalPages(result.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Detalle del ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> obtenerTicket(@PathVariable Long id) {
        requirePlatformScope();
        TicketResponse response = ticketService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/tickets/{id}")
    @Operation(summary = "Responder / cambiar estado / cambiar prioridad")
    public ResponseEntity<ApiResponse<TicketResponse>> actualizarTicket(
            @PathVariable Long id,
            @RequestBody ActualizarTicketRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        TicketResponse response = ticketService.actualizar(id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Ticket actualizado", response));
    }

    // ── Auditoría ──
    @GetMapping("/auditoria")
    @Operation(summary = "Logs de auditoría global")
    public ResponseEntity<ApiResponse<java.util.List<AuditoriaResponse>>> listarAuditoria(
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requirePlatformScope();

        java.time.LocalDateTime desde = null;
        java.time.LocalDateTime hasta = null;
        if (fechaDesde != null) desde = java.time.LocalDate.parse(fechaDesde).atStartOfDay();
        if (fechaHasta != null) hasta = java.time.LocalDate.parse(fechaHasta).atTime(23, 59, 59);

        var result = auditoriaRepository.buscar(tenantId, accion, desde, hasta,
                org.springframework.data.domain.PageRequest.of(page, size));

        var data = result.getContent().stream().map(a -> {
            String nombreUsuario = null;
            if (a.getUsuarioPlataformaId() != null) {
                nombreUsuario = usuarioPlataformaRepository.findById(a.getUsuarioPlataformaId())
                        .map(u -> u.getNombreCompleto()).orElse(null);
            }
            String tenantNombre = null;
            if (a.getTenantId() != null) {
                tenantNombre = tenantRepository.findById(a.getTenantId())
                        .map(t -> t.getNombre()).orElse(null);
            }
            return AuditoriaResponse.builder()
                    .id(a.getId())
                    .usuarioPlataformaId(a.getUsuarioPlataformaId())
                    .nombreUsuario(nombreUsuario)
                    .tenantId(a.getTenantId())
                    .tenantNombre(tenantNombre)
                    .accion(a.getAccion())
                    .detalle(a.getDetalle())
                    .ipAddress(a.getIpAddress())
                    .createdAt(a.getCreatedAt())
                    .build();
        }).toList();

        return ResponseEntity.ok(ApiResponse.<java.util.List<AuditoriaResponse>>builder()
                .success(true)
                .data(data)
                .pagination(ApiResponse.PaginationMeta.builder()
                        .page(page)
                        .size(size)
                        .totalElements(result.getTotalElements())
                        .totalPages(result.getTotalPages())
                        .build())
                .build());
    }
}
