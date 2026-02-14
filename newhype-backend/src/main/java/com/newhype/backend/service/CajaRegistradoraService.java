package com.newhype.backend.service;

import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.entity.CajaRegistradora;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.CajaRegistradoraRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CajaRegistradoraService {

    private final CajaRegistradoraRepository cajaRegistradoraRepository;

    public CajaRegistradoraService(CajaRegistradoraRepository cajaRegistradoraRepository) {
        this.cajaRegistradoraRepository = cajaRegistradoraRepository;
    }

    @Transactional(readOnly = true)
    public List<CajaRegistradoraResponse> listar() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return cajaRegistradoraRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CajaRegistradoraResponse crear(CrearCajaRegistradoraRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        CajaRegistradora caja = CajaRegistradora.builder()
                .tenantId(tenantId)
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .ubicacion(request.getUbicacion())
                .build();

        caja = cajaRegistradoraRepository.save(caja);
        return toResponse(caja);
    }

    @Transactional
    public CajaRegistradoraResponse actualizar(Long id, CrearCajaRegistradoraRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        CajaRegistradora caja = cajaRegistradoraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Caja registradora", id));

        caja.setCodigo(request.getCodigo());
        caja.setNombre(request.getNombre());
        caja.setUbicacion(request.getUbicacion());

        caja = cajaRegistradoraRepository.save(caja);
        return toResponse(caja);
    }

    @Transactional
    public CajaRegistradoraResponse cambiarEstado(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        CajaRegistradora caja = cajaRegistradoraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Caja registradora", id));

        caja.setEstado(!caja.getEstado());
        caja = cajaRegistradoraRepository.save(caja);
        return toResponse(caja);
    }

    private CajaRegistradoraResponse toResponse(CajaRegistradora c) {
        return CajaRegistradoraResponse.builder()
                .id(c.getId())
                .codigo(c.getCodigo())
                .nombre(c.getNombre())
                .ubicacion(c.getUbicacion())
                .estado(c.getEstado())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
