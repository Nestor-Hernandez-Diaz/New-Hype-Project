package com.newhype.backend.controller;

import com.newhype.backend.entity.UnidadMedida;
import com.newhype.backend.service.UnidadMedidaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion/unidades-medida")
@Tag(name = "Unidades de Medida", description = "Gestión de unidades de medida")
public class UnidadMedidaController extends AbstractCatalogController<UnidadMedida> {

    public UnidadMedidaController(UnidadMedidaService unidadMedidaService) {
        super(unidadMedidaService);
    }
}
