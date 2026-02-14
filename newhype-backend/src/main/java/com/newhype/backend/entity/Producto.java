package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "sku", nullable = false, length = 50)
    private String sku;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "slug", length = 250)
    private String slug;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "categoria_id")
    private Long categoriaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", insertable = false, updatable = false)
    private Categoria categoria;

    @Column(name = "talla_id")
    private Long tallaId;

    @Column(name = "color_id")
    private Long colorId;

    @Column(name = "marca_id")
    private Long marcaId;

    @Column(name = "material_id")
    private Long materialId;

    @Column(name = "genero_id")
    private Long generoId;

    @Column(name = "unidad_medida_id")
    private Long unidadMedidaId;

    @Column(name = "codigo_barras", length = 20)
    private String codigoBarras;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(name = "precio_costo", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCosto;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    @Column(name = "controla_inventario")
    private Boolean controlaInventario;

    @Column(name = "en_liquidacion")
    private Boolean enLiquidacion;

    @Column(name = "porcentaje_liquidacion", precision = 5, scale = 2)
    private BigDecimal porcentajeLiquidacion;

    @Column(name = "fecha_inicio_liquidacion")
    private LocalDate fechaInicioLiquidacion;

    @Column(name = "fecha_fin_liquidacion")
    private LocalDate fechaFinLiquidacion;

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
        if (controlaInventario == null) controlaInventario = true;
        if (enLiquidacion == null) enLiquidacion = false;
        if (precioCosto == null) precioCosto = BigDecimal.ZERO;
        if (stockMinimo == null) stockMinimo = 0;
        if (porcentajeLiquidacion == null) porcentajeLiquidacion = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
