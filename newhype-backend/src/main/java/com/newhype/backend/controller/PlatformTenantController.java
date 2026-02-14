package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.Tenant;
import com.newhype.backend.security.TenantContext;
import com.newhype.backend.service.PagoSuscripcionService;
import com.newhype.backend.service.PlatformTenantService;
import com.newhype.backend.service.SuscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform/tenants")
@Tag(name = "Platform - Tenants", description = "Gestión de tenants (Superadmin)")
public class PlatformTenantController {

    private final PlatformTenantService tenantService;
    private final SuscripcionService suscripcionService;
    private final PagoSuscripcionService pagoService;

    public PlatformTenantController(PlatformTenantService tenantService,
                                     SuscripcionService suscripcionService,
                                     PagoSuscripcionService pagoService) {
        this.tenantService = tenantService;
        this.suscripcionService = suscripcionService;
        this.pagoService = pagoService;
    }

    private void requirePlatformScope() {
        if (!TenantContext.isPlatformScope()) {
            throw new SecurityException("Acceso denegado: se requiere scope platform");
        }
    }

    @PostMapping
    @Operation(summary = "Crear tenant + admin user + suscripción opcional")
    public ResponseEntity<ApiResponse<TenantResponse>> crear(
            @Valid @RequestBody CrearTenantRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        TenantResponse response = tenantService.crear(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Tenant creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar tenants con filtros")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        requirePlatformScope();
        Tenant.EstadoTenant estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            estadoEnum = Tenant.EstadoTenant.valueOf(estado);
        }
        Page<TenantResponse> result = tenantService.listar(estadoEnum, q, page, size);
        return ResponseEntity.ok(ApiResponse.<List<TenantResponse>>builder()
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

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de tenant con plan, métricas")
    public ResponseEntity<ApiResponse<TenantResponse>> obtenerPorId(@PathVariable Long id) {
        requirePlatformScope();
        TenantResponse response = tenantService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos del tenant + overrides de límites")
    public ResponseEntity<ApiResponse<TenantResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarTenantRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        TenantResponse response = tenantService.actualizar(id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Tenant actualizado", response));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Suspender/activar tenant (motivo obligatorio si SUSPENDIDA)")
    public ResponseEntity<ApiResponse<TenantResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoTenantRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        TenantResponse response = tenantService.cambiarEstado(id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Estado del tenant actualizado", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete del tenant")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        tenantService.eliminar(id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Tenant eliminado", null));
    }

    @GetMapping("/{id}/modulos")
    @Operation(summary = "Módulos activos del tenant (plan + overrides)")
    public ResponseEntity<ApiResponse<List<ModuloResponse>>> obtenerModulos(@PathVariable Long id) {
        requirePlatformScope();
        List<ModuloResponse> modulos = tenantService.obtenerModulos(id);
        return ResponseEntity.ok(ApiResponse.ok(modulos));
    }

    @PutMapping("/{id}/modulos")
    @Operation(summary = "Override manual de módulos del tenant")
    public ResponseEntity<ApiResponse<List<ModuloResponse>>> actualizarModulos(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarModulosTenantRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        List<ModuloResponse> modulos = tenantService.actualizarModulos(id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Módulos actualizados", modulos));
    }

    @PostMapping("/{id}/suscripcion")
    @Operation(summary = "Asignar/cambiar plan a tenant")
    public ResponseEntity<ApiResponse<SuscripcionResponse>> asignarPlan(
            @PathVariable Long id,
            @Valid @RequestBody AsignarPlanRequest request,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        SuscripcionResponse response = suscripcionService.asignarPlan(id, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Plan asignado", response));
    }

    @PostMapping("/{id}/recordatorio-pago")
    @Operation(summary = "Enviar recordatorio de pago al tenant")
    public ResponseEntity<ApiResponse<String>> enviarRecordatorio(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        requirePlatformScope();
        String mensaje = suscripcionService.enviarRecordatorio(id, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok(mensaje));
    }

    @GetMapping("/{id}/pagos")
    @Operation(summary = "Historial de pagos de un tenant")
    public ResponseEntity<ApiResponse<List<PagoResponse>>> historialPagos(@PathVariable Long id) {
        requirePlatformScope();
        List<PagoResponse> pagos = pagoService.historialPagos(id);
        return ResponseEntity.ok(ApiResponse.ok(pagos));
    }
}
