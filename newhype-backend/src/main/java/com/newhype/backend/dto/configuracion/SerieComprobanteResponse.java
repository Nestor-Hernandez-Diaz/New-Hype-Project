package com.newhype.backend.dto.configuracion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SerieComprobanteResponse {

    private Long id;
    private String tipoComprobante;
    private String serie;
    private Integer numeroActual;
    private Integer numeroInicio;
    private Integer numeroFin;
    private String puntoEmision;
    private Boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
