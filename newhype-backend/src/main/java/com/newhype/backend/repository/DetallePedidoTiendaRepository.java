package com.newhype.backend.repository;

import com.newhype.backend.entity.DetallePedidoTienda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetallePedidoTiendaRepository extends JpaRepository<DetallePedidoTienda, Long> {

    List<DetallePedidoTienda> findByPedidoTiendaId(Long pedidoTiendaId);
}
