package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "tallas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Talla extends CatalogBaseEntity {

    @Column(name = "descripcion", nullable = false, length = 50)
    private String descripcion;

    @Column(name = "orden_visualizacion")
    private Integer ordenVisualizacion;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (ordenVisualizacion == null) ordenVisualizacion = 0;
    }
}
