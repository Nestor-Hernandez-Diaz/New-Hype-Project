package com.newhype.backend.repository;

import com.newhype.backend.entity.CajaRegistradora;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CajaRegistradoraRepository extends JpaRepository<CajaRegistradora, Long> {

    List<CajaRegistradora> findByTenantId(Long tenantId);

    List<CajaRegistradora> findByTenantIdAndEstadoTrue(Long tenantId);

    Optional<CajaRegistradora> findByIdAndTenantId(Long id, Long tenantId);
}
