package com.newhype.backend.repository;

import com.newhype.backend.entity.DetalleOrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleOrdenCompraRepository extends JpaRepository<DetalleOrdenCompra, Long> {

    List<DetalleOrdenCompra> findByOrdenCompraId(Long ordenCompraId);

    void deleteByOrdenCompraId(Long ordenCompraId);
}
