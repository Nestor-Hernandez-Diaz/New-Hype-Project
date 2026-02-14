package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_almacen")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAlmacen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", insertable = false, updatable = false)
    private Producto producto;

    @Column(name = "almacen_id", nullable = false)
    private Long almacenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "almacen_id", insertable = false, updatable = false)
    private Almacen almacen;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (cantidad == null) cantidad = 0;
        if (stockMinimo == null) stockMinimo = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
