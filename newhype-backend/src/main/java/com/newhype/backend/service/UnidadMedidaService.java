package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.UnidadMedida;
import com.newhype.backend.repository.UnidadMedidaRepository;
import org.springframework.stereotype.Service;

@Service
public class UnidadMedidaService extends AbstractCatalogService<UnidadMedida> {

    public UnidadMedidaService(UnidadMedidaRepository unidadMedidaRepository) {
        super(unidadMedidaRepository);
    }

    @Override
    protected UnidadMedida newEntity() {
        return new UnidadMedida();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, UnidadMedida entity) {
        entity.setNombre(request.getNombre());
        entity.setSimbolo(request.getSimbolo());
        entity.setDescripcion(request.getDescripcion());
    }

    @Override
    protected void enrichResponse(UnidadMedida entity, CatalogResponse response) {
        response.setNombre(entity.getNombre());
        response.setSimbolo(entity.getSimbolo());
        response.setDescripcion(entity.getDescripcion());
    }

    @Override
    protected String catalogDisplayName() {
        return "unidad de medida";
    }
}
