package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "series_comprobantes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SerieComprobante {

    public enum TipoComprobante {
        BOLETA, FACTURA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_comprobante", nullable = false)
    private TipoComprobante tipoComprobante;

    @Column(name = "serie", nullable = false, length = 4)
    private String serie;

    @Column(name = "numero_actual")
    private Integer numeroActual;

    @Column(name = "numero_inicio")
    private Integer numeroInicio;

    @Column(name = "numero_fin")
    private Integer numeroFin;

    @Column(name = "punto_emision", length = 50)
    private String puntoEmision;

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
        if (numeroActual == null) numeroActual = 0;
        if (numeroInicio == null) numeroInicio = 1;
        if (numeroFin == null) numeroFin = 99999999;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
