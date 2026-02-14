package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.CatalogBaseEntity;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.CatalogBaseRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractCatalogService<T extends CatalogBaseEntity> {

    protected final CatalogBaseRepository<T> repository;

    protected AbstractCatalogService(CatalogBaseRepository<T> repository) {
        this.repository = repository;
    }

    // ── Template methods (subclass must implement) ──

    protected abstract T newEntity();

    protected abstract void mapSpecificFields(CatalogRequest request, T entity);

    protected abstract void enrichResponse(T entity, CatalogResponse response);

    protected abstract String catalogDisplayName();

    // ── Concrete CRUD ──

    @Transactional(readOnly = true)
    public List<CatalogResponse> listar() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return repository.findByTenantIdAndEstadoTrue(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CatalogResponse crear(CatalogRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (repository.existsByTenantIdAndCodigo(tenantId, request.getCodigo())) {
            throw new IllegalArgumentException(
                    "Ya existe " + catalogDisplayName() + " con código: " + request.getCodigo());
        }

        T entity = newEntity();
        entity.setTenantId(tenantId);
        entity.setCodigo(request.getCodigo());
        mapSpecificFields(request, entity);

        entity = repository.save(entity);
        return toResponse(entity);
    }

    @Transactional
    public CatalogResponse actualizar(Long id, CatalogRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        T entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(catalogDisplayName(), id));

        entity.setCodigo(request.getCodigo());
        mapSpecificFields(request, entity);

        entity = repository.save(entity);
        return toResponse(entity);
    }

    @Transactional
    public void eliminar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        T entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(catalogDisplayName(), id));

        entity.setEstado(false);
        repository.save(entity);
    }

    // ── Mapper ──

    protected CatalogResponse toResponse(T entity) {
        CatalogResponse response = CatalogResponse.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .estado(entity.getEstado())
                .createdAt(entity.getCreatedAt())
                .build();
        enrichResponse(entity, response);
        return response;
    }
}
