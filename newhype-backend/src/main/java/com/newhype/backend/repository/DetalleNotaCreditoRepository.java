package com.newhype.backend.repository;

import com.newhype.backend.entity.DetalleNotaCredito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleNotaCreditoRepository extends JpaRepository<DetalleNotaCredito, Long> {

    List<DetalleNotaCredito> findByNotaCreditoId(Long notaCreditoId);
}
