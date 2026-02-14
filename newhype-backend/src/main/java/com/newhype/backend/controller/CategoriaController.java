package com.newhype.backend.controller;

import com.newhype.backend.entity.Categoria;
import com.newhype.backend.service.CategoriaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/categorias")
@Tag(name = "Categorías", description = "Gestión de categorías")
public class CategoriaController extends AbstractCatalogController<Categoria> {

    public CategoriaController(CategoriaService categoriaService) {
        super(categoriaService);
    }
}
