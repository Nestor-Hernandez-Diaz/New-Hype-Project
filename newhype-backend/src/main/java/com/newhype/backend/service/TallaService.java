package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.Talla;
import com.newhype.backend.repository.TallaRepository;
import org.springframework.stereotype.Service;

@Service
public class TallaService extends AbstractCatalogService<Talla> {

    public TallaService(TallaRepository tallaRepository) {
        super(tallaRepository);
    }

    @Override
    protected Talla newEntity() {
        return new Talla();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, Talla entity) {
        entity.setDescripcion(request.getDescripcion());
        entity.setOrdenVisualizacion(request.getOrdenVisualizacion());
    }

    @Override
    protected void enrichResponse(Talla entity, CatalogResponse response) {
        response.setDescripcion(entity.getDescripcion());
        response.setOrdenVisualizacion(entity.getOrdenVisualizacion());
    }

    @Override
    protected String catalogDisplayName() {
        return "talla";
    }
}
