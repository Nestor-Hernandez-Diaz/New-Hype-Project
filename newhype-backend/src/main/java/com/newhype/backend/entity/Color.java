package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "colores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Color extends CatalogBaseEntity {

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "codigo_hex", length = 7)
    private String codigoHex;
}
