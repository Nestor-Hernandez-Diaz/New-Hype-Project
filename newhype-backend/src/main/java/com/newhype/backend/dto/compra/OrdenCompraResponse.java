package com.newhype.backend.dto.compra;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrdenCompraResponse {

    private Long id;
    private String codigo;
    private Long proveedorId;
    private String proveedorNombre;
    private Long almacenDestinoId;
    private String almacenDestinoNombre;
    private Long usuarioId;
    private LocalDate fechaEmision;
    private LocalDate fechaEntregaEstimada;
    private String condicionesPago;
    private String formaPago;
    private String moneda;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal igv;
    private BigDecimal total;
    private String estado;
    private String observaciones;
    private List<DetalleOrdenCompraResponse> detalles;
    private LocalDateTime createdAt;
}
