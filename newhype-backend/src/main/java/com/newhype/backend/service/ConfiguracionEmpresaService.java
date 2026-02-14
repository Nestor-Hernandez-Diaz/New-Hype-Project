package com.newhype.backend.service;

import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.entity.ConfiguracionEmpresa;
import com.newhype.backend.entity.ConfiguracionEmpresa.ServidorSunat;
import com.newhype.backend.repository.ConfiguracionEmpresaRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracionEmpresaService {

    private final ConfiguracionEmpresaRepository configuracionEmpresaRepository;

    public ConfiguracionEmpresaService(ConfiguracionEmpresaRepository configuracionEmpresaRepository) {
        this.configuracionEmpresaRepository = configuracionEmpresaRepository;
    }

    @Transactional(readOnly = true)
    public ConfiguracionEmpresaResponse obtener() {
        Long tenantId = TenantContext.getCurrentTenantId();
        ConfiguracionEmpresa config = configuracionEmpresaRepository.findByTenantId(tenantId)
                .orElse(null);

        if (config == null) {
            return ConfiguracionEmpresaResponse.builder().build();
        }

        return toResponse(config);
    }

    @Transactional
    public ConfiguracionEmpresaResponse actualizar(ConfiguracionEmpresaRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        ConfiguracionEmpresa config = configuracionEmpresaRepository.findByTenantId(tenantId)
                .orElse(ConfiguracionEmpresa.builder().tenantId(tenantId).build());

        if (request.getRuc() != null) config.setRuc(request.getRuc());
        if (request.getRazonSocial() != null) config.setRazonSocial(request.getRazonSocial());
        if (request.getNombreComercial() != null) config.setNombreComercial(request.getNombreComercial());
        if (request.getDireccion() != null) config.setDireccion(request.getDireccion());
        if (request.getTelefono() != null) config.setTelefono(request.getTelefono());
        if (request.getEmail() != null) config.setEmail(request.getEmail());
        if (request.getWebsite() != null) config.setWebsite(request.getWebsite());
        if (request.getLogoUrl() != null) config.setLogoUrl(request.getLogoUrl());
        if (request.getDepartamento() != null) config.setDepartamento(request.getDepartamento());
        if (request.getProvincia() != null) config.setProvincia(request.getProvincia());
        if (request.getDistrito() != null) config.setDistrito(request.getDistrito());
        if (request.getIgvActivo() != null) config.setIgvActivo(request.getIgvActivo());
        if (request.getIgvPorcentaje() != null) config.setIgvPorcentaje(request.getIgvPorcentaje());
        if (request.getMoneda() != null) config.setMoneda(request.getMoneda());
        if (request.getSunatUsuario() != null) config.setSunatUsuario(request.getSunatUsuario());
        if (request.getSunatClave() != null) config.setSunatClave(request.getSunatClave());
        if (request.getSunatServidor() != null) {
            config.setSunatServidor(ServidorSunat.valueOf(request.getSunatServidor()));
        }

        config = configuracionEmpresaRepository.save(config);
        return toResponse(config);
    }

    @Transactional(readOnly = true)
    public PoliticaDevolucionesResponse obtenerPolitica() {
        Long tenantId = TenantContext.getCurrentTenantId();
        ConfiguracionEmpresa config = configuracionEmpresaRepository.findByTenantId(tenantId)
                .orElse(null);

        if (config == null) {
            return PoliticaDevolucionesResponse.builder()
                    .diasDevolucionBoleta(7)
                    .diasDevolucionFactura(30)
                    .requiereEtiquetasOriginales(true)
                    .requiereProductoSinUso(true)
                    .diasVigenciaVale(90)
                    .build();
        }

        return PoliticaDevolucionesResponse.builder()
                .diasDevolucionBoleta(config.getDiasDevolucionBoleta())
                .diasDevolucionFactura(config.getDiasDevolucionFactura())
                .requiereEtiquetasOriginales(config.getRequiereEtiquetasOriginales())
                .requiereProductoSinUso(config.getRequiereProductoSinUso())
                .diasVigenciaVale(config.getDiasVigenciaVale())
                .build();
    }

    @Transactional
    public PoliticaDevolucionesResponse actualizarPolitica(PoliticaDevolucionesRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        ConfiguracionEmpresa config = configuracionEmpresaRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Debe configurar la empresa primero (PUT /configuracion/empresa)"));

        if (request.getDiasDevolucionBoleta() != null)
            config.setDiasDevolucionBoleta(request.getDiasDevolucionBoleta());
        if (request.getDiasDevolucionFactura() != null)
            config.setDiasDevolucionFactura(request.getDiasDevolucionFactura());
        if (request.getRequiereEtiquetasOriginales() != null)
            config.setRequiereEtiquetasOriginales(request.getRequiereEtiquetasOriginales());
        if (request.getRequiereProductoSinUso() != null)
            config.setRequiereProductoSinUso(request.getRequiereProductoSinUso());
        if (request.getDiasVigenciaVale() != null)
            config.setDiasVigenciaVale(request.getDiasVigenciaVale());

        config = configuracionEmpresaRepository.save(config);

        return PoliticaDevolucionesResponse.builder()
                .diasDevolucionBoleta(config.getDiasDevolucionBoleta())
                .diasDevolucionFactura(config.getDiasDevolucionFactura())
                .requiereEtiquetasOriginales(config.getRequiereEtiquetasOriginales())
                .requiereProductoSinUso(config.getRequiereProductoSinUso())
                .diasVigenciaVale(config.getDiasVigenciaVale())
                .build();
    }

    private ConfiguracionEmpresaResponse toResponse(ConfiguracionEmpresa c) {
        return ConfiguracionEmpresaResponse.builder()
                .id(c.getId())
                .ruc(c.getRuc())
                .razonSocial(c.getRazonSocial())
                .nombreComercial(c.getNombreComercial())
                .direccion(c.getDireccion())
                .telefono(c.getTelefono())
                .email(c.getEmail())
                .website(c.getWebsite())
                .logoUrl(c.getLogoUrl())
                .departamento(c.getDepartamento())
                .provincia(c.getProvincia())
                .distrito(c.getDistrito())
                .igvActivo(c.getIgvActivo())
                .igvPorcentaje(c.getIgvPorcentaje())
                .moneda(c.getMoneda())
                .sunatUsuario(c.getSunatUsuario())
                .sunatServidor(c.getSunatServidor() != null ? c.getSunatServidor().name() : null)
                .diasDevolucionBoleta(c.getDiasDevolucionBoleta())
                .diasDevolucionFactura(c.getDiasDevolucionFactura())
                .requiereEtiquetasOriginales(c.getRequiereEtiquetasOriginales())
                .requiereProductoSinUso(c.getRequiereProductoSinUso())
                .diasVigenciaVale(c.getDiasVigenciaVale())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
