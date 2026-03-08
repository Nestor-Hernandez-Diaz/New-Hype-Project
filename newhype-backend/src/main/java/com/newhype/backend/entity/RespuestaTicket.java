package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "respuestas_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaTicket {

    public enum AutorTipo {
        TENANT, PLATFORM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Enumerated(EnumType.STRING)
    @Column(name = "autor_tipo", nullable = false)
    private AutorTipo autorTipo;

    @Column(name = "autor_id", nullable = false)
    private Long autorId;

    @Column(name = "mensaje", columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
