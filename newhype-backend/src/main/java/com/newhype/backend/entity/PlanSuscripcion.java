package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "planes_suscripcion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanSuscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_mensual", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioMensual;

    @Column(name = "precio_anual", precision = 10, scale = 2)
    private BigDecimal precioAnual;

    @Column(name = "max_productos")
    private Integer maxProductos;

    @Column(name = "max_usuarios")
    private Integer maxUsuarios;

    @Column(name = "max_almacenes")
    private Integer maxAlmacenes;

    @Column(name = "max_ventas_mes")
    private Integer maxVentasMes;

    @Column(name = "periodo_prueba_dias")
    private Integer periodoPruebaDias;

    @Column(name = "estado")
    private Boolean estado;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estado == null) estado = true;
        if (maxProductos == null) maxProductos = 0;
        if (maxUsuarios == null) maxUsuarios = 0;
        if (maxAlmacenes == null) maxAlmacenes = 0;
        if (maxVentasMes == null) maxVentasMes = 0;
        if (periodoPruebaDias == null) periodoPruebaDias = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
