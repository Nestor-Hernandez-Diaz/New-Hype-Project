package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "distritos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Distrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, length = 6)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "provincia_id", nullable = false)
    private Long provinciaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provincia_id", insertable = false, updatable = false)
    private Provincia provincia;
}
