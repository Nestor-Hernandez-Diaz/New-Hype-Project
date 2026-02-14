package com.newhype.backend.service;

import com.newhype.backend.dto.entidad.EntidadEstadisticasResponse;
import com.newhype.backend.dto.entidad.EntidadRequest;
import com.newhype.backend.dto.entidad.EntidadResponse;
import com.newhype.backend.entity.EntidadComercial;
import com.newhype.backend.entity.EntidadComercial.TipoEntidad;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.EntidadComercialRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Optional;

@Service
public class EntidadComercialService {

    private final EntidadComercialRepository entidadRepository;

    public EntidadComercialService(EntidadComercialRepository entidadRepository) {
        this.entidadRepository = entidadRepository;
    }

    @Transactional
    public EntidadResponse crear(EntidadRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        validarDocumento(request.getTipoDocumento(), request.getNumeroDocumento());

        if (entidadRepository.existsByTenantIdAndTipoDocumentoAndNumeroDocumento(
                tenantId, request.getTipoDocumento(), request.getNumeroDocumento())) {
            throw new IllegalArgumentException("Ya existe una entidad con " +
                    request.getTipoDocumento() + ": " + request.getNumeroDocumento());
        }

        TipoEntidad tipoEntidad = TipoEntidad.CLIENTE;
        if (request.getTipoEntidad() != null) {
            tipoEntidad = TipoEntidad.valueOf(request.getTipoEntidad());
        }

        if ((tipoEntidad == TipoEntidad.PROVEEDOR || tipoEntidad == TipoEntidad.AMBOS)
                && !"RUC".equals(request.getTipoDocumento())) {
            throw new IllegalArgumentException("Proveedores requieren RUC como tipo de documento");
        }

        EntidadComercial entidad = EntidadComercial.builder()
                .tenantId(tenantId)
                .tipoEntidad(tipoEntidad)
                .tipoDocumento(request.getTipoDocumento())
                .numeroDocumento(request.getNumeroDocumento())
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .razonSocial(request.getRazonSocial())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .direccion(request.getDireccion())
                .departamentoId(request.getDepartamentoId())
                .provinciaId(request.getProvinciaId())
                .distritoId(request.getDistritoId())
                .build();

        entidad = entidadRepository.save(entidad);
        return toResponse(entidad);
    }

    @Transactional(readOnly = true)
    public Page<EntidadResponse> listar(String tipoEntidad, String q, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();

        TipoEntidad tipo = null;
        if (tipoEntidad != null && !tipoEntidad.isBlank()) {
            tipo = TipoEntidad.valueOf(tipoEntidad);
        }

        return entidadRepository.buscar(tenantId, tipo, q, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public EntidadResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        EntidadComercial entidad = entidadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Entidad comercial", id));
        return toResponse(entidad);
    }

    @Transactional
    public EntidadResponse actualizar(Long id, EntidadRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        EntidadComercial entidad = entidadRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Entidad comercial", id));

        // No se puede cambiar tipo_documento ni numero_documento
        entidad.setNombres(request.getNombres());
        entidad.setApellidos(request.getApellidos());
        entidad.setRazonSocial(request.getRazonSocial());
        entidad.setEmail(request.getEmail());
        entidad.setTelefono(request.getTelefono());
        entidad.setDireccion(request.getDireccion());
        entidad.setDepartamentoId(request.getDepartamentoId());
        entidad.setProvinciaId(request.getProvinciaId());
        entidad.setDistritoId(request.getDistritoId());

        if (request.getTipoEntidad() != null) {
            entidad.setTipoEntidad(TipoEntidad.valueOf(request.getTipoEntidad()));
        }

        entidad = entidadRepository.save(entidad);
        return toResponse(entidad);
    }

    @Transactional(readOnly = true)
    public Optional<EntidadResponse> buscarPorDocumento(String tipoDocumento, String numeroDocumento) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return entidadRepository.findByTenantIdAndTipoDocumentoAndNumeroDocumento(
                tenantId, tipoDocumento, numeroDocumento).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<EntidadResponse> buscarPorEmail(String email) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return entidadRepository.findByTenantIdAndEmail(tenantId, email).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public EntidadEstadisticasResponse estadisticas() {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime inicioMes = LocalDateTime.now()
                .with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        return EntidadEstadisticasResponse.builder()
                .totalClientes(entidadRepository.countByTenantIdAndTipoEntidad(tenantId, TipoEntidad.CLIENTE))
                .totalProveedores(entidadRepository.countByTenantIdAndTipoEntidad(tenantId, TipoEntidad.PROVEEDOR))
                .totalAmbos(entidadRepository.countByTenantIdAndTipoEntidad(tenantId, TipoEntidad.AMBOS))
                .totalActivos(entidadRepository.countByTenantIdAndEstadoTrue(tenantId))
                .registradosMes(entidadRepository.countByTenantIdAndCreatedAtAfter(tenantId, inicioMes))
                .build();
    }

    private void validarDocumento(String tipo, String numero) {
        switch (tipo) {
            case "DNI":
                if (numero == null || !numero.matches("\\d{8}"))
                    throw new IllegalArgumentException("DNI debe tener exactamente 8 dígitos");
                break;
            case "RUC":
                if (numero == null || !numero.matches("\\d{11}"))
                    throw new IllegalArgumentException("RUC debe tener exactamente 11 dígitos");
                break;
            case "CE":
                if (numero == null || !numero.matches("[A-Za-z0-9]{9,12}"))
                    throw new IllegalArgumentException("CE debe tener entre 9 y 12 caracteres alfanuméricos");
                break;
            case "PASAPORTE":
                if (numero == null || numero.length() < 5 || numero.length() > 20)
                    throw new IllegalArgumentException("Pasaporte debe tener entre 5 y 20 caracteres");
                break;
            default:
                throw new IllegalArgumentException("Tipo de documento no válido: " + tipo);
        }
    }

    private EntidadResponse toResponse(EntidadComercial e) {
        return EntidadResponse.builder()
                .id(e.getId())
                .tipoEntidad(e.getTipoEntidad() != null ? e.getTipoEntidad().name() : null)
                .tipoDocumento(e.getTipoDocumento())
                .numeroDocumento(e.getNumeroDocumento())
                .nombres(e.getNombres())
                .apellidos(e.getApellidos())
                .razonSocial(e.getRazonSocial())
                .email(e.getEmail())
                .telefono(e.getTelefono())
                .direccion(e.getDireccion())
                .departamentoId(e.getDepartamentoId())
                .provinciaId(e.getProvinciaId())
                .distritoId(e.getDistritoId())
                .estado(e.getEstado())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
