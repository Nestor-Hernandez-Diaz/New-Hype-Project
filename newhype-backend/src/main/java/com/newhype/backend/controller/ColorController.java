package com.newhype.backend.controller;

import com.newhype.backend.entity.Color;
import com.newhype.backend.service.ColorService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/colores")
@Tag(name = "Colores", description = "Gestión de colores")
public class ColorController extends AbstractCatalogController<Color> {

    public ColorController(ColorService colorService) {
        super(colorService);
    }
}
