package com.newhype.backend.repository;

import com.newhype.backend.entity.ModuloTenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuloTenantRepository extends JpaRepository<ModuloTenant, Long> {

    List<ModuloTenant> findByTenantId(Long tenantId);

    void deleteByTenantId(Long tenantId);
}
