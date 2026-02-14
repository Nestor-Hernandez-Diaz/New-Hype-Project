package com.newhype.backend.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogRequest {

    @NotBlank(message = "El código es obligatorio")
    @Size(max = 20)
    private String codigo;

    @Size(max = 100)
    private String nombre;

    @Size(max = 120)
    private String slug;

    private String descripcion;

    @Size(max = 7)
    private String codigoHex;

    @Size(max = 500)
    private String logoUrl;

    private Integer ordenVisualizacion;

    @Size(max = 10)
    private String simbolo;
}
