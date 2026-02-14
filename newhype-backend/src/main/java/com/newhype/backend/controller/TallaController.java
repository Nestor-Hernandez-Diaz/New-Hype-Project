package com.newhype.backend.controller;

import com.newhype.backend.entity.Talla;
import com.newhype.backend.service.TallaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/tallas")
@Tag(name = "Tallas", description = "Gestión de tallas")
public class TallaController extends AbstractCatalogController<Talla> {

    public TallaController(TallaService tallaService) {
        super(tallaService);
    }
}
