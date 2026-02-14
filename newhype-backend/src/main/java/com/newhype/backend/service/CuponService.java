package com.newhype.backend.service;

import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.Cupon;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.CuponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CuponService {

    private final CuponRepository cuponRepository;

    public CuponService(CuponRepository cuponRepository) {
        this.cuponRepository = cuponRepository;
    }

    // ── POST /platform/cupones ──
    @Transactional
    public CuponResponse crear(CrearCuponRequest request) {
        if (cuponRepository.existsByCodigo(request.getCodigo())) {
            throw new IllegalArgumentException("Ya existe un cupón con ese código");
        }

        Cupon cupon = Cupon.builder()
                .codigo(request.getCodigo().toUpperCase())
                .tipoDescuento(Cupon.TipoDescuento.valueOf(request.getTipoDescuento()))
                .valorDescuento(request.getValorDescuento())
                .fechaExpiracion(request.getFechaExpiracion())
                .usosMaximos(request.getUsosMaximos() != null ? request.getUsosMaximos() : 0)
                .build();
        cupon = cuponRepository.save(cupon);

        return toResponse(cupon);
    }

    // ── GET /platform/cupones ──
    @Transactional(readOnly = true)
    public List<CuponResponse> listar() {
        return cuponRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CuponResponse toResponse(Cupon cupon) {
        return CuponResponse.builder()
                .id(cupon.getId())
                .codigo(cupon.getCodigo())
                .tipoDescuento(cupon.getTipoDescuento() != null ? cupon.getTipoDescuento().name() : null)
                .valorDescuento(cupon.getValorDescuento())
                .fechaExpiracion(cupon.getFechaExpiracion())
                .usosMaximos(cupon.getUsosMaximos())
                .usosActuales(cupon.getUsosActuales())
                .estado(cupon.getEstado())
                .createdAt(cupon.getCreatedAt())
                .updatedAt(cupon.getUpdatedAt())
                .build();
    }
}
