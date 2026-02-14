package com.newhype.backend.dto.caja;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SesionCajaResponse {

    private Long id;
    private Long cajaRegistradoraId;
    private Long usuarioId;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private BigDecimal montoApertura;
    private BigDecimal montoCierre;
    private BigDecimal totalVentas;
    private BigDecimal diferencia;
    private String estado;
    private String observaciones;
    private List<MovimientoCajaResponse> movimientos;
    private LocalDateTime createdAt;
}
