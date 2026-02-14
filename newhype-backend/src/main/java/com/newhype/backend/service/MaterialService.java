package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.Material;
import com.newhype.backend.repository.MaterialRepository;
import org.springframework.stereotype.Service;

@Service
public class MaterialService extends AbstractCatalogService<Material> {

    public MaterialService(MaterialRepository materialRepository) {
        super(materialRepository);
    }

    @Override
    protected Material newEntity() {
        return new Material();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, Material entity) {
        entity.setDescripcion(request.getDescripcion());
    }

    @Override
    protected void enrichResponse(Material entity, CatalogResponse response) {
        response.setDescripcion(entity.getDescripcion());
    }

    @Override
    protected String catalogDisplayName() {
        return "material";
    }
}
