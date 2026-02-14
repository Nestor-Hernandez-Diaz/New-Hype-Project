package com.newhype.backend.repository;

import com.newhype.backend.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByEmail(String email);

    Optional<Tenant> findBySubdominio(String subdominio);

    boolean existsByEmail(String email);

    boolean existsBySubdominio(String subdominio);
}
