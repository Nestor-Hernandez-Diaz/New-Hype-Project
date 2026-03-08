package com.newhype.backend.dto.cotizacion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CotizacionResponse {

    private Long id;
    private String codigoCotizacion;
    private Long clienteId;
    private String clienteNombre;
    private Long almacenId;
    private String almacenNombre;
    private Long usuarioId;
    private LocalDateTime fechaEmision;
    private LocalDateTime fechaVencimiento;
    private Integer diasValidez;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;
    private String estado;
    private String observaciones;
    private String motivoRechazo;
    private Integer intentosConversion;
    private List<DetalleCotizacionResponse> detalles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
