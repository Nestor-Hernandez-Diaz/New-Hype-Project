package com.newhype.backend.service;

import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.entity.MotivoMovimiento;
import com.newhype.backend.entity.MotivoMovimiento.TipoMotivo;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.MotivoMovimientoRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MotivoMovimientoService {

    private final MotivoMovimientoRepository motivoMovimientoRepository;

    public MotivoMovimientoService(MotivoMovimientoRepository motivoMovimientoRepository) {
        this.motivoMovimientoRepository = motivoMovimientoRepository;
    }

    @Transactional(readOnly = true)
    public List<MotivoMovimientoResponse> listar(String tipo) {
        Long tenantId = TenantContext.getCurrentTenantId();

        List<MotivoMovimiento> motivos;
        if (tipo != null && !tipo.isBlank()) {
            TipoMotivo tipoMotivo = TipoMotivo.valueOf(tipo.toUpperCase());
            motivos = motivoMovimientoRepository.findByTenantIdAndTipo(tenantId, tipoMotivo);
        } else {
            motivos = motivoMovimientoRepository.findByTenantId(tenantId);
        }

        return motivos.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MotivoMovimientoResponse crear(CrearMotivoMovimientoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (motivoMovimientoRepository.existsByTenantIdAndCodigo(tenantId, request.getCodigo())) {
            throw new IllegalArgumentException("Ya existe un motivo con código " + request.getCodigo());
        }

        TipoMotivo tipoMotivo = TipoMotivo.valueOf(request.getTipo().toUpperCase());

        MotivoMovimiento motivo = MotivoMovimiento.builder()
                .tenantId(tenantId)
                .tipo(tipoMotivo)
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .requiereDocumento(request.getRequiereDocumento())
                .build();

        motivo = motivoMovimientoRepository.save(motivo);
        return toResponse(motivo);
    }

    @Transactional
    public MotivoMovimientoResponse actualizar(Long id, CrearMotivoMovimientoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        MotivoMovimiento motivo = motivoMovimientoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Motivo de movimiento", id));

        if (!motivo.getCodigo().equals(request.getCodigo()) &&
            motivoMovimientoRepository.existsByTenantIdAndCodigo(tenantId, request.getCodigo())) {
            throw new IllegalArgumentException("Ya existe un motivo con código " + request.getCodigo());
        }

        TipoMotivo tipoMotivo = TipoMotivo.valueOf(request.getTipo().toUpperCase());

        motivo.setTipo(tipoMotivo);
        motivo.setCodigo(request.getCodigo());
        motivo.setNombre(request.getNombre());
        motivo.setDescripcion(request.getDescripcion());
        if (request.getRequiereDocumento() != null) motivo.setRequiereDocumento(request.getRequiereDocumento());

        motivo = motivoMovimientoRepository.save(motivo);
        return toResponse(motivo);
    }

    private MotivoMovimientoResponse toResponse(MotivoMovimiento m) {
        return MotivoMovimientoResponse.builder()
                .id(m.getId())
                .tipo(m.getTipo().name())
                .codigo(m.getCodigo())
                .nombre(m.getNombre())
                .descripcion(m.getDescripcion())
                .requiereDocumento(m.getRequiereDocumento())
                .estado(m.getEstado())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
