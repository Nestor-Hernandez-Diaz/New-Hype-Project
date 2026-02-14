package com.newhype.backend.dto.configuracion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UbigeoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private Long parentId; // departamentoId for provincias, provinciaId for distritos
}
