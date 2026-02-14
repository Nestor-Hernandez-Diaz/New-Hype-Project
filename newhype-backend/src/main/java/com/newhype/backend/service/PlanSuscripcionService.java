package com.newhype.backend.service;

import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanSuscripcionService {

    private final PlanSuscripcionRepository planRepository;
    private final ModuloPlanRepository moduloPlanRepository;
    private final ModuloSistemaRepository moduloSistemaRepository;
    private final SuscripcionRepository suscripcionRepository;

    public PlanSuscripcionService(PlanSuscripcionRepository planRepository,
                                   ModuloPlanRepository moduloPlanRepository,
                                   ModuloSistemaRepository moduloSistemaRepository,
                                   SuscripcionRepository suscripcionRepository) {
        this.planRepository = planRepository;
        this.moduloPlanRepository = moduloPlanRepository;
        this.moduloSistemaRepository = moduloSistemaRepository;
        this.suscripcionRepository = suscripcionRepository;
    }

    // ── POST /platform/planes ──
    @Transactional
    public PlanResponse crear(CrearPlanRequest request) {
        if (planRepository.existsByNombre(request.getNombre())) {
            throw new IllegalArgumentException("Ya existe un plan con ese nombre");
        }

        PlanSuscripcion plan = PlanSuscripcion.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .precioMensual(request.getPrecioMensual())
                .precioAnual(request.getPrecioAnual())
                .maxProductos(request.getMaxProductos())
                .maxUsuarios(request.getMaxUsuarios())
                .maxAlmacenes(request.getMaxAlmacenes())
                .maxVentasMes(request.getMaxVentasMes())
                .periodoPruebaDias(request.getPeriodoPruebaDias())
                .build();
        plan = planRepository.save(plan);

        // Assign modules
        if (request.getModuloIds() != null) {
            for (Long moduloId : request.getModuloIds()) {
                ModuloPlan mp = ModuloPlan.builder()
                        .planId(plan.getId())
                        .moduloId(moduloId)
                        .build();
                moduloPlanRepository.save(mp);
            }
        }

        return toResponse(plan);
    }

    // ── GET /platform/planes ──
    @Transactional(readOnly = true)
    public List<PlanResponse> listar() {
        List<PlanSuscripcion> planes = planRepository.findAllByOrderByCreatedAtDesc();
        return planes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── PUT /platform/planes/{id} ──
    @Transactional
    public PlanResponse actualizar(Long id, CrearPlanRequest request) {
        PlanSuscripcion plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", id));

        if (!plan.getNombre().equals(request.getNombre()) && planRepository.existsByNombre(request.getNombre())) {
            throw new IllegalArgumentException("Ya existe un plan con ese nombre");
        }

        plan.setNombre(request.getNombre());
        if (request.getDescripcion() != null) plan.setDescripcion(request.getDescripcion());
        plan.setPrecioMensual(request.getPrecioMensual());
        if (request.getPrecioAnual() != null) plan.setPrecioAnual(request.getPrecioAnual());
        if (request.getMaxProductos() != null) plan.setMaxProductos(request.getMaxProductos());
        if (request.getMaxUsuarios() != null) plan.setMaxUsuarios(request.getMaxUsuarios());
        if (request.getMaxAlmacenes() != null) plan.setMaxAlmacenes(request.getMaxAlmacenes());
        if (request.getMaxVentasMes() != null) plan.setMaxVentasMes(request.getMaxVentasMes());
        if (request.getPeriodoPruebaDias() != null) plan.setPeriodoPruebaDias(request.getPeriodoPruebaDias());

        plan = planRepository.save(plan);

        // Update modules if provided
        if (request.getModuloIds() != null) {
            moduloPlanRepository.deleteByPlanId(plan.getId());
            for (Long moduloId : request.getModuloIds()) {
                ModuloPlan mp = ModuloPlan.builder()
                        .planId(plan.getId())
                        .moduloId(moduloId)
                        .build();
                moduloPlanRepository.save(mp);
            }
        }

        return toResponse(plan);
    }

    // ── PATCH /platform/planes/{id}/estado ──
    @Transactional
    public PlanResponse cambiarEstado(Long id) {
        PlanSuscripcion plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", id));

        plan.setEstado(!plan.getEstado());
        plan = planRepository.save(plan);

        return toResponse(plan);
    }

    private PlanResponse toResponse(PlanSuscripcion plan) {
        long cantidadTenants = suscripcionRepository.countByPlanId(plan.getId());

        List<ModuloPlan> modulosPlan = moduloPlanRepository.findByPlanId(plan.getId());
        List<ModuloResponse> modulosResponse = modulosPlan.stream().map(mp -> {
            ModuloSistema modulo = moduloSistemaRepository.findById(mp.getModuloId()).orElse(null);
            if (modulo == null) return null;
            return ModuloResponse.builder()
                    .id(modulo.getId())
                    .codigo(modulo.getCodigo())
                    .nombre(modulo.getNombre())
                    .descripcion(modulo.getDescripcion())
                    .activo(true)
                    .build();
        }).filter(m -> m != null).collect(Collectors.toList());

        return PlanResponse.builder()
                .id(plan.getId())
                .nombre(plan.getNombre())
                .descripcion(plan.getDescripcion())
                .precioMensual(plan.getPrecioMensual())
                .precioAnual(plan.getPrecioAnual())
                .maxProductos(plan.getMaxProductos())
                .maxUsuarios(plan.getMaxUsuarios())
                .maxAlmacenes(plan.getMaxAlmacenes())
                .maxVentasMes(plan.getMaxVentasMes())
                .periodoPruebaDias(plan.getPeriodoPruebaDias())
                .estado(plan.getEstado())
                .cantidadTenants(cantidadTenants)
                .modulos(modulosResponse)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
