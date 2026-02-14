package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provincias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Provincia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, length = 6)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "departamento_id", nullable = false)
    private Long departamentoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", insertable = false, updatable = false)
    private Departamento departamento;
}
