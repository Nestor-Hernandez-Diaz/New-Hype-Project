package com.newhype.backend.controller;

import com.newhype.backend.entity.Marca;
import com.newhype.backend.service.MarcaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/marcas")
@Tag(name = "Marcas", description = "Gestión de marcas")
public class MarcaController extends AbstractCatalogController<Marca> {

    public MarcaController(MarcaService marcaService) {
        super(marcaService);
    }
}
