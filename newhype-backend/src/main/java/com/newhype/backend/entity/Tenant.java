package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "subdominio", nullable = false, unique = true, length = 50)
    private String subdominio;

    @Column(name = "propietario_nombre", nullable = false, length = 200)
    private String propietarioNombre;

    @Column(name = "propietario_tipo_documento", nullable = false, length = 10)
    private String propietarioTipoDocumento;

    @Column(name = "propietario_numero_documento", nullable = false, length = 20)
    private String propietarioNumeroDocumento;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "direccion", columnDefinition = "TEXT")
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoTenant estado;

    @Column(name = "motivo_suspension", columnDefinition = "TEXT")
    private String motivoSuspension;

    @Column(name = "ultima_actividad")
    private LocalDateTime ultimaActividad;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum EstadoTenant {
        ACTIVA, SUSPENDIDA, ELIMINADA
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estado == null) estado = EstadoTenant.ACTIVA;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
