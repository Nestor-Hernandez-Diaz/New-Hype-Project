package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets_soporte")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketSoporte {

    public enum Prioridad {
        BAJA, MEDIA, ALTA, CRITICA
    }

    public enum EstadoTicket {
        ABIERTO, EN_PROCESO, CERRADO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "usuario_plataforma_id")
    private Long usuarioPlataformaId;

    @Column(name = "asunto", nullable = false, length = 200)
    private String asunto;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad")
    private Prioridad prioridad;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoTicket estado;

    @Column(name = "respuesta", columnDefinition = "TEXT")
    private String respuesta;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (prioridad == null) prioridad = Prioridad.MEDIA;
        if (estado == null) estado = EstadoTicket.ABIERTO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
