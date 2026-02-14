package com.newhype.backend.service;

import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.Color;
import com.newhype.backend.repository.ColorRepository;
import org.springframework.stereotype.Service;

@Service
public class ColorService extends AbstractCatalogService<Color> {

    public ColorService(ColorRepository colorRepository) {
        super(colorRepository);
    }

    @Override
    protected Color newEntity() {
        return new Color();
    }

    @Override
    protected void mapSpecificFields(CatalogRequest request, Color entity) {
        entity.setNombre(request.getNombre());
        entity.setCodigoHex(request.getCodigoHex());
    }

    @Override
    protected void enrichResponse(Color entity, CatalogResponse response) {
        response.setNombre(entity.getNombre());
        response.setCodigoHex(entity.getCodigoHex());
    }

    @Override
    protected String catalogDisplayName() {
        return "color";
    }
}
