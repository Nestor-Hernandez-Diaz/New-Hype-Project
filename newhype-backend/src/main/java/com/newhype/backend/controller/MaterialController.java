package com.newhype.backend.controller;

import com.newhype.backend.entity.Material;
import com.newhype.backend.service.MaterialService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/materiales")
@Tag(name = "Materiales", description = "Gestión de materiales")
public class MaterialController extends AbstractCatalogController<Material> {

    public MaterialController(MaterialService materialService) {
        super(materialService);
    }
}
