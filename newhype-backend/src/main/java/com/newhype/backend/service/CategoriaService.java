package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.Categoria;
import com.newhype.backend.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoriaService extends AbstractCatalogService<Categoria> {

    public CategoriaService(CategoriaRepository categoriaRepository) {
        super(categoriaRepository);
    }

    @Override
    protected Categoria newEntity() {
        return new Categoria();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, Categoria entity) {
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        // Generate slug from nombre
        if (request.getNombre() != null) {
            String slug = request.getNombre().toLowerCase()
                    .replaceAll("[^a-z0-9]", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("^-|-$", "");
            entity.setSlug(slug);
        }
    }

    @Override
    protected void enrichResponse(Categoria entity, CatalogResponse response) {
        response.setNombre(entity.getNombre());
        response.setSlug(entity.getSlug());
        response.setDescripcion(entity.getDescripcion());
    }

    @Override
    protected String catalogDisplayName() {
        return "categoría";
    }
}
