package com.newhype.backend.service;

import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.entity.MetodoPago;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.MetodoPagoRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetodoPagoService {

    private final MetodoPagoRepository metodoPagoRepository;

    public MetodoPagoService(MetodoPagoRepository metodoPagoRepository) {
        this.metodoPagoRepository = metodoPagoRepository;
    }

    @Transactional(readOnly = true)
    public List<MetodoPagoResponse> listar() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<MetodoPago> metodos = metodoPagoRepository.findByTenantIdAndEstadoTrue(tenantId);
        return metodos.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MetodoPagoResponse crear(CrearMetodoPagoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        MetodoPago metodo = MetodoPago.builder()
                .tenantId(tenantId)
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .tipo(request.getTipo())
                .requiereReferencia(request.getRequiereReferencia())
                .predeterminado(request.getPredeterminado())
                .build();

        metodo = metodoPagoRepository.save(metodo);
        return toResponse(metodo);
    }

    @Transactional
    public MetodoPagoResponse actualizar(Long id, CrearMetodoPagoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        MetodoPago metodo = metodoPagoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago", id));

        metodo.setCodigo(request.getCodigo());
        metodo.setNombre(request.getNombre());
        metodo.setDescripcion(request.getDescripcion());
        metodo.setTipo(request.getTipo());
        if (request.getRequiereReferencia() != null) metodo.setRequiereReferencia(request.getRequiereReferencia());
        if (request.getPredeterminado() != null) metodo.setPredeterminado(request.getPredeterminado());

        metodo = metodoPagoRepository.save(metodo);
        return toResponse(metodo);
    }

    @Transactional
    public MetodoPagoResponse cambiarEstado(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        MetodoPago metodo = metodoPagoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago", id));

        metodo.setEstado(!metodo.getEstado());
        metodo = metodoPagoRepository.save(metodo);
        return toResponse(metodo);
    }

    private MetodoPagoResponse toResponse(MetodoPago m) {
        return MetodoPagoResponse.builder()
                .id(m.getId())
                .codigo(m.getCodigo())
                .nombre(m.getNombre())
                .descripcion(m.getDescripcion())
                .tipo(m.getTipo())
                .requiereReferencia(m.getRequiereReferencia())
                .predeterminado(m.getPredeterminado())
                .estado(m.getEstado())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
