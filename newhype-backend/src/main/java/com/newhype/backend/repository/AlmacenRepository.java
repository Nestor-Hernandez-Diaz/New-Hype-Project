package com.newhype.backend.repository;

import com.newhype.backend.entity.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    List<Almacen> findByTenantId(Long tenantId);

    List<Almacen> findByTenantIdAndEstadoTrue(Long tenantId);

    Optional<Almacen> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndCodigo(Long tenantId, String codigo);
}
