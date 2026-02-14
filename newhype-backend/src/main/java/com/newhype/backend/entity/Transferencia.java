package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transferencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transferencia {

    public enum EstadoTransferencia {
        PENDIENTE, APROBADA, CANCELADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "codigo", nullable = false, length = 20)
    private String codigo;

    @Column(name = "almacen_origen_id", nullable = false)
    private Long almacenOrigenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "almacen_origen_id", insertable = false, updatable = false)
    private Almacen almacenOrigen;

    @Column(name = "almacen_destino_id", nullable = false)
    private Long almacenDestinoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "almacen_destino_id", insertable = false, updatable = false)
    private Almacen almacenDestino;

    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "solicitado_por_id", nullable = false)
    private Long solicitadoPorId;

    @Column(name = "aprobado_por_id")
    private Long aprobadoPorId;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "recibido_por_id")
    private Long recibidoPorId;

    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoTransferencia estado;

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
        if (estado == null) estado = EstadoTransferencia.PENDIENTE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
