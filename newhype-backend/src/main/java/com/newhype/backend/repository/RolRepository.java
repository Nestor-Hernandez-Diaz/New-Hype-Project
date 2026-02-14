package com.newhype.backend.repository;

import com.newhype.backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByTenantIdAndNombre(Long tenantId, String nombre);

    Optional<Rol> findByIdAndTenantId(Long id, Long tenantId);

    List<Rol> findByTenantId(Long tenantId);

    List<Rol> findByTenantIdAndEstadoTrue(Long tenantId);
}
