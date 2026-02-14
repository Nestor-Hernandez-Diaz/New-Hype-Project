package com.newhype.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_empresa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionEmpresa {

    public enum ServidorSunat {
        HOMOLOGACION, PRODUCCION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "ruc", nullable = false, length = 11)
    private String ruc;

    @Column(name = "razon_social", nullable = false, length = 200)
    private String razonSocial;

    @Column(name = "nombre_comercial", length = 200)
    private String nombreComercial;

    @Column(name = "direccion", columnDefinition = "TEXT", nullable = false)
    private String direccion;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "website", length = 200)
    private String website;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "provincia", length = 100)
    private String provincia;

    @Column(name = "distrito", length = 100)
    private String distrito;

    @Column(name = "igv_activo")
    private Boolean igvActivo;

    @Column(name = "igv_porcentaje", precision = 5, scale = 2)
    private BigDecimal igvPorcentaje;

    @Column(name = "moneda", length = 3)
    private String moneda;

    @Column(name = "sunat_usuario", length = 100)
    private String sunatUsuario;

    @Column(name = "sunat_clave", length = 200)
    private String sunatClave;

    @Enumerated(EnumType.STRING)
    @Column(name = "sunat_servidor")
    private ServidorSunat sunatServidor;

    // Politica de devoluciones
    @Column(name = "dias_devolucion_boleta")
    private Integer diasDevolucionBoleta;

    @Column(name = "dias_devolucion_factura")
    private Integer diasDevolucionFactura;

    @Column(name = "requiere_etiquetas_originales")
    private Boolean requiereEtiquetasOriginales;

    @Column(name = "requiere_producto_sin_uso")
    private Boolean requiereProductoSinUso;

    @Column(name = "dias_vigencia_vale")
    private Integer diasVigenciaVale;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (igvActivo == null) igvActivo = true;
        if (igvPorcentaje == null) igvPorcentaje = new BigDecimal("18.00");
        if (moneda == null) moneda = "PEN";
        if (sunatServidor == null) sunatServidor = ServidorSunat.HOMOLOGACION;
        if (diasDevolucionBoleta == null) diasDevolucionBoleta = 7;
        if (diasDevolucionFactura == null) diasDevolucionFactura = 30;
        if (requiereEtiquetasOriginales == null) requiereEtiquetasOriginales = true;
        if (requiereProductoSinUso == null) requiereProductoSinUso = true;
        if (diasVigenciaVale == null) diasVigenciaVale = 90;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
