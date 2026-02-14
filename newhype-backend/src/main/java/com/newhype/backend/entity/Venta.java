package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    public enum TipoComprobante {
        BOLETA, FACTURA, NOTA_VENTA
    }

    public enum EstadoVenta {
        PENDIENTE, COMPLETADA, CANCELADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "codigo_venta", nullable = false, length = 30)
    private String codigoVenta;

    @Column(name = "sesion_caja_id")
    private Long sesionCajaId;

    @Column(name = "cliente_id")
    private Long clienteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", insertable = false, updatable = false)
    private EntidadComercial cliente;

    @Column(name = "almacen_id", nullable = false)
    private Long almacenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "almacen_id", insertable = false, updatable = false)
    private Almacen almacen;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_comprobante")
    private TipoComprobante tipoComprobante;

    @Column(name = "serie", length = 4)
    private String serie;

    @Column(name = "numero", length = 8)
    private String numero;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "igv", precision = 10, scale = 2)
    private BigDecimal igv;

    @Column(name = "descuento", precision = 10, scale = 2)
    private BigDecimal descuento;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "monto_recibido", precision = 10, scale = 2)
    private BigDecimal montoRecibido;

    @Column(name = "monto_cambio", precision = 10, scale = 2)
    private BigDecimal montoCambio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoVenta estado;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estado == null) estado = EstadoVenta.PENDIENTE;
        if (tipoComprobante == null) tipoComprobante = TipoComprobante.BOLETA;
        if (subtotal == null) subtotal = BigDecimal.ZERO;
        if (igv == null) igv = BigDecimal.ZERO;
        if (descuento == null) descuento = BigDecimal.ZERO;
        if (total == null) total = BigDecimal.ZERO;
        if (montoRecibido == null) montoRecibido = BigDecimal.ZERO;
        if (montoCambio == null) montoCambio = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
