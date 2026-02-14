package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.Genero;
import com.newhype.backend.repository.GeneroRepository;
import org.springframework.stereotype.Service;

@Service
public class GeneroService extends AbstractCatalogService<Genero> {

    public GeneroService(GeneroRepository generoRepository) {
        super(generoRepository);
    }

    @Override
    protected Genero newEntity() {
        return new Genero();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, Genero entity) {
        entity.setDescripcion(request.getDescripcion());
    }

    @Override
    protected void enrichResponse(Genero entity, CatalogResponse response) {
        response.setDescripcion(entity.getDescripcion());
    }

    @Override
    protected String catalogDisplayName() {
        return "género";
    }
}
