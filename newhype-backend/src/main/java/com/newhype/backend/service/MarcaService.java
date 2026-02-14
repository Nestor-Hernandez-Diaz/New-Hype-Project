package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.Marca;
import com.newhype.backend.repository.MarcaRepository;
import org.springframework.stereotype.Service;

@Service
public class MarcaService extends AbstractCatalogService<Marca> {

    public MarcaService(MarcaRepository marcaRepository) {
        super(marcaRepository);
    }

    @Override
    protected Marca newEntity() {
        return new Marca();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, Marca entity) {
        entity.setNombre(request.getNombre());
        entity.setLogoUrl(request.getLogoUrl());
    }

    @Override
    protected void enrichResponse(Marca entity, CatalogResponse response) {
        response.setNombre(entity.getNombre());
        response.setLogoUrl(entity.getLogoUrl());
    }

    @Override
    protected String catalogDisplayName() {
        return "marca";
    }
}
