package com.newhype.backend.repository;

import com.newhype.backend.entity.ConfiguracionEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracionEmpresaRepository extends JpaRepository<ConfiguracionEmpresa, Long> {

    Optional<ConfiguracionEmpresa> findByTenantId(Long tenantId);
}
