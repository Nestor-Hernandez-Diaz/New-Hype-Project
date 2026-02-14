package com.newhype.backend.repository;

import com.newhype.backend.entity.PagoVenta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoVentaRepository extends JpaRepository<PagoVenta, Long> {

    List<PagoVenta> findByVentaId(Long ventaId);
}
