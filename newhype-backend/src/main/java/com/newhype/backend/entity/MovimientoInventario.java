package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {

    public enum TipoMovimiento {
        ENTRADA, SALIDA, AJUSTE_INGRESO, AJUSTE_EGRESO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "almacen_id", nullable = false)
    private Long almacenId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoMovimiento tipo;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "stock_antes", nullable = false)
    private Integer stockAntes;

    @Column(name = "stock_despues", nullable = false)
    private Integer stockDespues;

    @Column(name = "motivo_id")
    private Long motivoId;

    @Column(name = "documento_referencia", length = 100)
    private String documentoReferencia;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
