package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "modulos_plan",
       uniqueConstraints = @UniqueConstraint(columnNames = {"plan_id", "modulo_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "modulo_id", nullable = false)
    private Long moduloId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id", insertable = false, updatable = false)
    private ModuloSistema modulo;
}
