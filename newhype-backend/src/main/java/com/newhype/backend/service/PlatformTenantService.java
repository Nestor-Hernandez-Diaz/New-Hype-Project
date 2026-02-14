package com.newhype.backend.service;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import com.newhype.backend.security.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlatformTenantService {

    private final TenantRepository tenantRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final PlanSuscripcionRepository planRepository;
    private final ModuloPlanRepository moduloPlanRepository;
    private final ModuloTenantRepository moduloTenantRepository;
    private final ModuloSistemaRepository moduloSistemaRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaPlataformaService auditoriaService;

    public PlatformTenantService(TenantRepository tenantRepository,
                                  UsuarioRepository usuarioRepository,
                                  RolRepository rolRepository,
                                  SuscripcionRepository suscripcionRepository,
                                  PlanSuscripcionRepository planRepository,
                                  ModuloPlanRepository moduloPlanRepository,
                                  ModuloTenantRepository moduloTenantRepository,
                                  ModuloSistemaRepository moduloSistemaRepository,
                                  PasswordEncoder passwordEncoder,
                                  AuditoriaPlataformaService auditoriaService) {
        this.tenantRepository = tenantRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.planRepository = planRepository;
        this.moduloPlanRepository = moduloPlanRepository;
        this.moduloTenantRepository = moduloTenantRepository;
        this.moduloSistemaRepository = moduloSistemaRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    // ── POST /platform/tenants ──
    @Transactional
    public TenantResponse crear(CrearTenantRequest request, HttpServletRequest httpRequest) {
        if (tenantRepository.existsBySubdominio(request.getSubdominio())) {
            throw new IllegalArgumentException("El subdominio ya está en uso");
        }
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado como tenant");
        }

        // Create tenant
        Tenant tenant = Tenant.builder()
                .nombre(request.getNombre())
                .subdominio(request.getSubdominio())
                .propietarioNombre(request.getPropietarioNombre())
                .propietarioTipoDocumento(request.getPropietarioTipoDocumento())
                .propietarioNumeroDocumento(request.getPropietarioNumeroDocumento())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .direccion(request.getDireccion())
                .build();
        tenant = tenantRepository.save(tenant);

        // Create ADMIN role for tenant
        Rol rol = Rol.builder()
                .tenantId(tenant.getId())
                .nombre("ADMIN")
                .descripcion("Administrador del tenant")
                .permisos("{\"all\": true}")
                .esSistema(true)
                .build();
        rol = rolRepository.save(rol);

        // Create admin user
        String username = request.getEmail().split("@")[0];
        Usuario usuario = Usuario.builder()
                .tenantId(tenant.getId())
                .rolId(rol.getId())
                .email(request.getEmail())
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                .nombre(request.getPropietarioNombre().split(" ")[0])
                .apellido(request.getPropietarioNombre().contains(" ")
                        ? request.getPropietarioNombre().substring(request.getPropietarioNombre().indexOf(" ") + 1)
                        : "")
                .build();
        usuarioRepository.save(usuario);

        // Create subscription if planId provided
        if (request.getPlanId() != null) {
            PlanSuscripcion plan = planRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan", request.getPlanId()));

            Suscripcion suscripcion = Suscripcion.builder()
                    .tenantId(tenant.getId())
                    .planId(plan.getId())
                    .fechaInicio(LocalDate.now())
                    .fechaFin(LocalDate.now().plusMonths(1))
                    .build();
            suscripcionRepository.save(suscripcion);
        }

        auditoriaService.registrar("CREAR_TENANT",
                "Tenant creado: " + tenant.getNombre() + " (id=" + tenant.getId() + ")",
                tenant.getId(), httpRequest);

        return toResponse(tenant);
    }

    // ── GET /platform/tenants ──
    @Transactional(readOnly = true)
    public Page<TenantResponse> listar(Tenant.EstadoTenant estado, String q, int page, int size) {
        Page<Tenant> tenants = tenantRepository.buscar(estado, q, PageRequest.of(page, size));
        return tenants.map(this::toResponse);
    }

    // ── GET /platform/tenants/{id} ──
    @Transactional(readOnly = true)
    public TenantResponse obtenerPorId(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));

        TenantResponse response = toResponse(tenant);

        // Enrich with subscription info
        suscripcionRepository.findFirstByTenantIdOrderByCreatedAtDesc(id).ifPresent(sub -> {
            response.setPlanId(sub.getPlanId());
            response.setEstadoSuscripcion(sub.getEstado().name());
            planRepository.findById(sub.getPlanId()).ifPresent(plan ->
                    response.setPlanActual(plan.getNombre()));
        });

        // Enrich with counts
        response.setCantidadUsuarios(usuarioRepository.countByTenantIdAndRolId(id, null));

        return response;
    }

    // ── PUT /platform/tenants/{id} ──
    @Transactional
    public TenantResponse actualizar(Long id, ActualizarTenantRequest request, HttpServletRequest httpRequest) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));

        if (request.getNombre() != null) tenant.setNombre(request.getNombre());
        if (request.getEmail() != null) tenant.setEmail(request.getEmail());
        if (request.getTelefono() != null) tenant.setTelefono(request.getTelefono());
        if (request.getDireccion() != null) tenant.setDireccion(request.getDireccion());

        tenant = tenantRepository.save(tenant);

        // Update subscription overrides if present
        suscripcionRepository.findFirstByTenantIdOrderByCreatedAtDesc(id).ifPresent(sub -> {
            boolean changed = false;
            if (request.getOverrideMaxProductos() != null) {
                sub.setOverrideMaxProductos(request.getOverrideMaxProductos());
                changed = true;
            }
            if (request.getOverrideMaxUsuarios() != null) {
                sub.setOverrideMaxUsuarios(request.getOverrideMaxUsuarios());
                changed = true;
            }
            if (request.getOverrideMaxAlmacenes() != null) {
                sub.setOverrideMaxAlmacenes(request.getOverrideMaxAlmacenes());
                changed = true;
            }
            if (request.getOverrideMaxVentasMes() != null) {
                sub.setOverrideMaxVentasMes(request.getOverrideMaxVentasMes());
                changed = true;
            }
            if (changed) suscripcionRepository.save(sub);
        });

        auditoriaService.registrar("ACTUALIZAR_TENANT",
                "Tenant actualizado: " + tenant.getNombre(), tenant.getId(), httpRequest);

        return toResponse(tenant);
    }

    // ── PATCH /platform/tenants/{id}/estado ──
    @Transactional
    public TenantResponse cambiarEstado(Long id, CambiarEstadoTenantRequest request, HttpServletRequest httpRequest) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));

        Tenant.EstadoTenant nuevoEstado = Tenant.EstadoTenant.valueOf(request.getEstado());

        if (nuevoEstado == Tenant.EstadoTenant.SUSPENDIDA && (request.getMotivo() == null || request.getMotivo().isBlank())) {
            throw new IllegalArgumentException("El motivo es obligatorio al suspender un tenant");
        }

        tenant.setEstado(nuevoEstado);
        if (nuevoEstado == Tenant.EstadoTenant.SUSPENDIDA) {
            tenant.setMotivoSuspension(request.getMotivo());
        } else {
            tenant.setMotivoSuspension(null);
        }

        tenant = tenantRepository.save(tenant);

        auditoriaService.registrar("CAMBIAR_ESTADO_TENANT",
                "Tenant " + tenant.getNombre() + " → " + nuevoEstado, tenant.getId(), httpRequest);

        return toResponse(tenant);
    }

    // ── DELETE /platform/tenants/{id} ──
    @Transactional
    public void eliminar(Long id, HttpServletRequest httpRequest) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", id));

        tenant.setEstado(Tenant.EstadoTenant.ELIMINADA);
        tenant.setDeletedAt(LocalDateTime.now());
        tenantRepository.save(tenant);

        auditoriaService.registrar("ELIMINAR_TENANT",
                "Tenant eliminado (soft): " + tenant.getNombre(), tenant.getId(), httpRequest);
    }

    // ── GET /platform/tenants/{id}/modulos ──
    @Transactional(readOnly = true)
    public List<ModuloResponse> obtenerModulos(Long tenantId) {
        tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        // Get all system modules
        List<ModuloSistema> todosModulos = moduloSistemaRepository.findByEstadoTrueOrderByCodigoAsc();

        // Get plan modules (from tenant's subscription)
        Suscripcion suscripcion = suscripcionRepository.findFirstByTenantIdOrderByCreatedAtDesc(tenantId).orElse(null);

        List<Long> modulosPlanIds = List.of();
        if (suscripcion != null) {
            modulosPlanIds = moduloPlanRepository.findByPlanId(suscripcion.getPlanId())
                    .stream().map(ModuloPlan::getModuloId).collect(Collectors.toList());
        }

        // Get tenant overrides
        List<ModuloTenant> overrides = moduloTenantRepository.findByTenantId(tenantId);
        var overrideMap = overrides.stream()
                .collect(Collectors.toMap(ModuloTenant::getModuloId, ModuloTenant::getActivo));

        // Merge: plan modules + overrides
        List<Long> finalPlanIds = modulosPlanIds;
        return todosModulos.stream().map(modulo -> {
            boolean activoPorPlan = finalPlanIds.contains(modulo.getId());
            Boolean override = overrideMap.get(modulo.getId());
            boolean activo = override != null ? override : activoPorPlan;

            return ModuloResponse.builder()
                    .id(modulo.getId())
                    .codigo(modulo.getCodigo())
                    .nombre(modulo.getNombre())
                    .descripcion(modulo.getDescripcion())
                    .activo(activo)
                    .build();
        }).collect(Collectors.toList());
    }

    // ── PUT /platform/tenants/{id}/modulos ──
    @Transactional
    public List<ModuloResponse> actualizarModulos(Long tenantId, ActualizarModulosTenantRequest request,
                                                    HttpServletRequest httpRequest) {
        tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        // Delete existing overrides
        moduloTenantRepository.deleteByTenantId(tenantId);

        // Insert new overrides
        for (var moduloEstado : request.getModulos()) {
            ModuloTenant mt = ModuloTenant.builder()
                    .tenantId(tenantId)
                    .moduloId(moduloEstado.getModuloId())
                    .activo(moduloEstado.getActivo())
                    .build();
            moduloTenantRepository.save(mt);
        }

        auditoriaService.registrar("ACTUALIZAR_MODULOS_TENANT",
                "Módulos actualizados para tenant id=" + tenantId, tenantId, httpRequest);

        return obtenerModulos(tenantId);
    }

    private TenantResponse toResponse(Tenant tenant) {
        return TenantResponse.builder()
                .id(tenant.getId())
                .nombre(tenant.getNombre())
                .subdominio(tenant.getSubdominio())
                .propietarioNombre(tenant.getPropietarioNombre())
                .propietarioTipoDocumento(tenant.getPropietarioTipoDocumento())
                .propietarioNumeroDocumento(tenant.getPropietarioNumeroDocumento())
                .email(tenant.getEmail())
                .telefono(tenant.getTelefono())
                .direccion(tenant.getDireccion())
                .estado(tenant.getEstado() != null ? tenant.getEstado().name() : null)
                .motivoSuspension(tenant.getMotivoSuspension())
                .ultimaActividad(tenant.getUltimaActividad())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
