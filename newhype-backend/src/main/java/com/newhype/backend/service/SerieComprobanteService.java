package com.newhype.backend.service;

import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.entity.SerieComprobante;
import com.newhype.backend.entity.SerieComprobante.TipoComprobante;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.SerieComprobanteRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SerieComprobanteService {

    private final SerieComprobanteRepository serieComprobanteRepository;

    public SerieComprobanteService(SerieComprobanteRepository serieComprobanteRepository) {
        this.serieComprobanteRepository = serieComprobanteRepository;
    }

    @Transactional(readOnly = true)
    public List<SerieComprobanteResponse> listar(String tipoComprobante) {
        Long tenantId = TenantContext.getCurrentTenantId();

        List<SerieComprobante> series;
        if (tipoComprobante != null && !tipoComprobante.isBlank()) {
            TipoComprobante tipo = TipoComprobante.valueOf(tipoComprobante.toUpperCase());
            series = serieComprobanteRepository.findByTenantIdAndTipoComprobante(tenantId, tipo);
        } else {
            series = serieComprobanteRepository.findByTenantId(tenantId);
        }

        return series.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SerieComprobanteResponse crear(CrearSerieComprobanteRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        TipoComprobante tipo = TipoComprobante.valueOf(request.getTipoComprobante().toUpperCase());

        if (serieComprobanteRepository.existsByTenantIdAndTipoComprobanteAndSerie(
                tenantId, tipo, request.getSerie().toUpperCase())) {
            throw new IllegalArgumentException("Ya existe una serie " + request.getSerie()
                    + " para " + tipo);
        }

        SerieComprobante serie = SerieComprobante.builder()
                .tenantId(tenantId)
                .tipoComprobante(tipo)
                .serie(request.getSerie().toUpperCase())
                .numeroInicio(request.getNumeroInicio() != null ? request.getNumeroInicio() : 1)
                .numeroFin(request.getNumeroFin() != null ? request.getNumeroFin() : 99999999)
                .puntoEmision(request.getPuntoEmision())
                .build();

        serie = serieComprobanteRepository.save(serie);
        return toResponse(serie);
    }

    @Transactional
    public SerieComprobanteResponse actualizar(Long id, CrearSerieComprobanteRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        SerieComprobante serie = serieComprobanteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Serie", id));

        TipoComprobante tipo = TipoComprobante.valueOf(request.getTipoComprobante().toUpperCase());

        // Check uniqueness if tipo or serie changed
        if (!serie.getTipoComprobante().equals(tipo) ||
            !serie.getSerie().equals(request.getSerie().toUpperCase())) {
            if (serieComprobanteRepository.existsByTenantIdAndTipoComprobanteAndSerie(
                    tenantId, tipo, request.getSerie().toUpperCase())) {
                throw new IllegalArgumentException("Ya existe una serie " + request.getSerie()
                        + " para " + tipo);
            }
        }

        serie.setTipoComprobante(tipo);
        serie.setSerie(request.getSerie().toUpperCase());
        if (request.getNumeroInicio() != null) serie.setNumeroInicio(request.getNumeroInicio());
        if (request.getNumeroFin() != null) serie.setNumeroFin(request.getNumeroFin());
        serie.setPuntoEmision(request.getPuntoEmision());

        serie = serieComprobanteRepository.save(serie);
        return toResponse(serie);
    }

    @Transactional
    public SerieComprobanteResponse cambiarEstado(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        SerieComprobante serie = serieComprobanteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Serie", id));

        serie.setEstado(!serie.getEstado());
        serie = serieComprobanteRepository.save(serie);
        return toResponse(serie);
    }

    private SerieComprobanteResponse toResponse(SerieComprobante s) {
        return SerieComprobanteResponse.builder()
                .id(s.getId())
                .tipoComprobante(s.getTipoComprobante().name())
                .serie(s.getSerie())
                .numeroActual(s.getNumeroActual())
                .numeroInicio(s.getNumeroInicio())
                .numeroFin(s.getNumeroFin())
                .puntoEmision(s.getPuntoEmision())
                .estado(s.getEstado())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
