package com.newhype.backend.repository;

import com.newhype.backend.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {

    List<MetodoPago> findByTenantIdAndEstadoTrue(Long tenantId);

    Optional<MetodoPago> findByIdAndTenantId(Long id, Long tenantId);
}
