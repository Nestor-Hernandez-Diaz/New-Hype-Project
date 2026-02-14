package com.newhype.backend.controller;

import com.newhype.backend.entity.Genero;
import com.newhype.backend.service.GeneroService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/generos")
@Tag(name = "Géneros", description = "Gestión de géneros")
public class GeneroController extends AbstractCatalogController<Genero> {

    public GeneroController(GeneroService generoService) {
        super(generoService);
    }
}
