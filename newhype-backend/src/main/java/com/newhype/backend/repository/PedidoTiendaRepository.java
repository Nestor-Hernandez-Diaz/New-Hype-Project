package com.newhype.backend.repository;

import com.newhype.backend.entity.PedidoTienda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PedidoTiendaRepository extends JpaRepository<PedidoTienda, Long> {

    Page<PedidoTienda> findByTenantIdAndClienteTiendaIdOrderByCreatedAtDesc(
            Long tenantId, Long clienteTiendaId, Pageable pageable);

    Optional<PedidoTienda> findByIdAndTenantIdAndClienteTiendaId(
            Long id, Long tenantId, Long clienteTiendaId);

    long countByTenantId(Long tenantId);

    // Admin: list all orders for tenant
    Page<PedidoTienda> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    // Admin: get single order by id and tenant
    Optional<PedidoTienda> findByIdAndTenantId(Long id, Long tenantId);

    // Lookup by linked venta
    Optional<PedidoTienda> findByVentaId(Long ventaId);
}
