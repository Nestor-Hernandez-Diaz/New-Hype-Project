package com.newhype.backend.service;

import com.newhype.backend.dto.caja.*;
import com.newhype.backend.entity.MovimientoCaja;
import com.newhype.backend.entity.MovimientoCaja.TipoMovimientoCaja;
import com.newhype.backend.entity.SesionCaja;
import com.newhype.backend.entity.SesionCaja.EstadoSesion;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.CajaRegistradoraRepository;
import com.newhype.backend.repository.MovimientoCajaRepository;
import com.newhype.backend.repository.SesionCajaRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CajaService {

    private final SesionCajaRepository sesionCajaRepository;
    private final MovimientoCajaRepository movimientoCajaRepository;
    private final CajaRegistradoraRepository cajaRegistradoraRepository;

    public CajaService(SesionCajaRepository sesionCajaRepository,
                       MovimientoCajaRepository movimientoCajaRepository,
                       CajaRegistradoraRepository cajaRegistradoraRepository) {
        this.sesionCajaRepository = sesionCajaRepository;
        this.movimientoCajaRepository = movimientoCajaRepository;
        this.cajaRegistradoraRepository = cajaRegistradoraRepository;
    }

    @Transactional
    public SesionCajaResponse abrirSesion(AbrirSesionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        // Validar que la caja registradora existe
        cajaRegistradoraRepository.findByIdAndTenantId(request.getCajaRegistradoraId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Caja registradora", request.getCajaRegistradoraId()));

        // Validar que el usuario no tenga una sesión abierta
        sesionCajaRepository.findByTenantIdAndUsuarioIdAndEstado(tenantId, usuarioId, EstadoSesion.ABIERTA)
                .ifPresent(s -> {
                    throw new IllegalArgumentException("Ya tiene una sesión de caja abierta (ID: " + s.getId() + ")");
                });

        SesionCaja sesion = SesionCaja.builder()
                .tenantId(tenantId)
                .cajaRegistradoraId(request.getCajaRegistradoraId())
                .usuarioId(usuarioId)
                .fechaApertura(LocalDateTime.now())
                .montoApertura(request.getMontoApertura() != null ? request.getMontoApertura() : BigDecimal.ZERO)
                .build();

        sesion = sesionCajaRepository.save(sesion);
        return toResponse(sesion, List.of());
    }

    @Transactional(readOnly = true)
    public List<SesionCajaResponse> listarSesiones(String estado, Long cajaId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        List<SesionCaja> sesiones;
        if (estado != null && cajaId != null) {
            sesiones = sesionCajaRepository.findByTenantIdAndCajaRegistradoraIdAndEstado(
                    tenantId, cajaId, EstadoSesion.valueOf(estado));
        } else if (estado != null) {
            sesiones = sesionCajaRepository.findByTenantIdAndEstado(tenantId, EstadoSesion.valueOf(estado));
        } else {
            sesiones = sesionCajaRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        }

        return sesiones.stream().map(s -> toResponse(s, null)).collect(Collectors.toList());
    }

    @Transactional
    public SesionCajaResponse cerrarSesion(Long id, CerrarSesionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        SesionCaja sesion = sesionCajaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión de caja", id));

        if (sesion.getEstado() != EstadoSesion.ABIERTA) {
            throw new IllegalArgumentException("La sesión ya está cerrada");
        }

        sesion.setFechaCierre(LocalDateTime.now());
        sesion.setMontoCierre(request.getMontoCierre());
        sesion.setObservaciones(request.getObservaciones());
        sesion.setEstado(EstadoSesion.CERRADA);

        // Calcular diferencia: montoCierre - (montoApertura + totalVentas + ingresos - egresos)
        List<MovimientoCaja> movimientos = movimientoCajaRepository.findBySesionCajaIdOrderByCreatedAtDesc(id);
        BigDecimal totalIngresos = movimientos.stream()
                .filter(m -> m.getTipo() == TipoMovimientoCaja.INGRESO)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEgresos = movimientos.stream()
                .filter(m -> m.getTipo() == TipoMovimientoCaja.EGRESO)
                .map(MovimientoCaja::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal esperado = sesion.getMontoApertura()
                .add(sesion.getTotalVentas())
                .add(totalIngresos)
                .subtract(totalEgresos);

        sesion.setDiferencia(request.getMontoCierre().subtract(esperado));

        sesion = sesionCajaRepository.save(sesion);
        return toResponse(sesion, movimientos.stream().map(this::toMovimientoResponse).collect(Collectors.toList()));
    }

    @Transactional
    public MovimientoCajaResponse registrarMovimiento(Long sesionId, MovimientoCajaRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        SesionCaja sesion = sesionCajaRepository.findByIdAndTenantId(sesionId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión de caja", sesionId));

        if (sesion.getEstado() != EstadoSesion.ABIERTA) {
            throw new IllegalArgumentException("No se puede registrar movimiento en una sesión cerrada");
        }

        MovimientoCaja movimiento = MovimientoCaja.builder()
                .tenantId(tenantId)
                .sesionCajaId(sesionId)
                .tipo(TipoMovimientoCaja.valueOf(request.getTipo()))
                .monto(request.getMonto())
                .motivo(request.getMotivo())
                .descripcion(request.getDescripcion())
                .usuarioId(usuarioId)
                .build();

        movimiento = movimientoCajaRepository.save(movimiento);
        return toMovimientoResponse(movimiento);
    }

    private SesionCajaResponse toResponse(SesionCaja s, List<MovimientoCajaResponse> movimientos) {
        return SesionCajaResponse.builder()
                .id(s.getId())
                .cajaRegistradoraId(s.getCajaRegistradoraId())
                .usuarioId(s.getUsuarioId())
                .fechaApertura(s.getFechaApertura())
                .fechaCierre(s.getFechaCierre())
                .montoApertura(s.getMontoApertura())
                .montoCierre(s.getMontoCierre())
                .totalVentas(s.getTotalVentas())
                .diferencia(s.getDiferencia())
                .estado(s.getEstado() != null ? s.getEstado().name() : null)
                .observaciones(s.getObservaciones())
                .movimientos(movimientos)
                .createdAt(s.getCreatedAt())
                .build();
    }

    private MovimientoCajaResponse toMovimientoResponse(MovimientoCaja m) {
        return MovimientoCajaResponse.builder()
                .id(m.getId())
                .sesionCajaId(m.getSesionCajaId())
                .tipo(m.getTipo() != null ? m.getTipo().name() : null)
                .monto(m.getMonto())
                .motivo(m.getMotivo())
                .descripcion(m.getDescripcion())
                .usuarioId(m.getUsuarioId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
