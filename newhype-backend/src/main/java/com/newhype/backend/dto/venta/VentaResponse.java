package com.newhype.backend.dto.venta;

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
public class VentaResponse {

    private Long id;
    private String codigoVenta;
    private Long sesionCajaId;
    private Long clienteId;
    private String clienteNombre;
    private Long almacenId;
    private String almacenNombre;
    private Long usuarioId;
    private LocalDateTime fechaEmision;
    private String tipoComprobante;
    private String serie;
    private String numero;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal descuento;
    private BigDecimal total;
    private BigDecimal montoRecibido;
    private BigDecimal montoCambio;
    private String estado;
    private LocalDateTime fechaPago;
    private String observaciones;
    private List<DetalleVentaResponse> detalles;
    private List<PagoVentaResponse> pagos;
    private LocalDateTime createdAt;
}
