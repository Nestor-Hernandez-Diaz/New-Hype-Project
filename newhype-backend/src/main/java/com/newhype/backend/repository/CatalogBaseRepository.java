package com.newhype.backend.repository;

import com.newhype.backend.entity.CatalogBaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;

@NoRepositoryBean
public interface CatalogBaseRepository<T extends CatalogBaseEntity> extends JpaRepository<T, Long> {

    List<T> findByTenantIdAndEstadoTrue(Long tenantId);

    Optional<T> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndCodigo(Long tenantId, String codigo);
}
