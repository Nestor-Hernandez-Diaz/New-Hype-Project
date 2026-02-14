package com.newhype.backend.repository;

import com.newhype.backend.entity.DetalleRecepcionCompra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleRecepcionCompraRepository extends JpaRepository<DetalleRecepcionCompra, Long> {

    List<DetalleRecepcionCompra> findByRecepcionId(Long recepcionId);
}
