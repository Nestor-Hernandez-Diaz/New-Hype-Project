package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imagenes_producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImagenProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "alt_text", length = 200)
    private String altText;

    @Column(name = "orden")
    private Integer orden;

    @Column(name = "es_principal")
    private Boolean esPrincipal;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (orden == null) orden = 0;
        if (esPrincipal == null) esPrincipal = false;
    }
}
