package com.newhype.backend.dto.notacredito;

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
public class NotaCreditoResponse {

    private Long id;
    private String codigo;
    private Long ventaOrigenId;
    private String serie;
    private String numero;
    private String motivoSunat;
    private String tipo;
    private String descripcion;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;
    private String metodoDevolucion;
    private LocalDateTime fechaReembolso;
    private Long usuarioId;
    private String estado;
    private List<DetalleNotaCreditoResponse> detalles;
    private LocalDateTime createdAt;
}
