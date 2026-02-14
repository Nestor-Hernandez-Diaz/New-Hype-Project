package com.newhype.backend.service;

import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.entity.Almacen;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.AlmacenRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlmacenService {

    private final AlmacenRepository almacenRepository;

    public AlmacenService(AlmacenRepository almacenRepository) {
        this.almacenRepository = almacenRepository;
    }

    @Transactional(readOnly = true)
    public List<AlmacenResponse> listar() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return almacenRepository.findByTenantId(tenantId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AlmacenResponse crear(CrearAlmacenRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (almacenRepository.existsByTenantIdAndCodigo(tenantId, request.getCodigo())) {
            throw new IllegalArgumentException("Ya existe un almacén con código " + request.getCodigo());
        }

        Almacen almacen = Almacen.builder()
                .tenantId(tenantId)
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .ubicacion(request.getUbicacion())
                .capacidad(request.getCapacidad())
                .build();

        almacen = almacenRepository.save(almacen);
        return toResponse(almacen);
    }

    @Transactional
    public AlmacenResponse actualizar(Long id, CrearAlmacenRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Almacen almacen = almacenRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén", id));

        if (!almacen.getCodigo().equals(request.getCodigo()) &&
            almacenRepository.existsByTenantIdAndCodigo(tenantId, request.getCodigo())) {
            throw new IllegalArgumentException("Ya existe un almacén con código " + request.getCodigo());
        }

        almacen.setCodigo(request.getCodigo());
        almacen.setNombre(request.getNombre());
        almacen.setUbicacion(request.getUbicacion());
        if (request.getCapacidad() != null) almacen.setCapacidad(request.getCapacidad());

        almacen = almacenRepository.save(almacen);
        return toResponse(almacen);
    }

    @Transactional
    public AlmacenResponse cambiarEstado(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Almacen almacen = almacenRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén", id));

        almacen.setEstado(!almacen.getEstado());
        almacen = almacenRepository.save(almacen);
        return toResponse(almacen);
    }

    private AlmacenResponse toResponse(Almacen a) {
        return AlmacenResponse.builder()
                .id(a.getId())
                .codigo(a.getCodigo())
                .nombre(a.getNombre())
                .ubicacion(a.getUbicacion())
                .capacidad(a.getCapacidad())
                .estado(a.getEstado())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
