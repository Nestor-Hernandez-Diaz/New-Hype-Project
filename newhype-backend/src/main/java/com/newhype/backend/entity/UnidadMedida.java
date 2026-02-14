package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "unidades_medida")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class UnidadMedida extends CatalogBaseEntity {

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "simbolo", length = 10)
    private String simbolo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
}
