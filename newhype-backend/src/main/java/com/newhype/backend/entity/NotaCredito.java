package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_credito")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaCredito {

    public enum TipoNotaCredito {
        ANULACION, DESCUENTO, DEVOLUCION, CORRECCION
    }

    public enum MetodoDevolucion {
        EFECTIVO, TRANSFERENCIA, VALE
    }

    public enum EstadoNotaCredito {
        PENDIENTE, APLICADA, CANCELADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "codigo", nullable = false, length = 30)
    private String codigo;

    @Column(name = "venta_origen_id", nullable = false)
    private Long ventaOrigenId;

    @Column(name = "serie", nullable = false, length = 4)
    private String serie;

    @Column(name = "numero", nullable = false, length = 8)
    private String numero;

    @Column(name = "motivo_sunat", nullable = false, length = 5)
    private String motivoSunat;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoNotaCredito tipo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "igv", precision = 10, scale = 2)
    private BigDecimal igv;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_devolucion")
    private MetodoDevolucion metodoDevolucion;

    @Column(name = "fecha_reembolso")
    private LocalDateTime fechaReembolso;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoNotaCredito estado;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estado == null) estado = EstadoNotaCredito.PENDIENTE;
        if (metodoDevolucion == null) metodoDevolucion = MetodoDevolucion.VALE;
        if (subtotal == null) subtotal = BigDecimal.ZERO;
        if (igv == null) igv = BigDecimal.ZERO;
        if (total == null) total = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
