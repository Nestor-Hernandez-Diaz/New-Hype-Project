package com.newhype.backend.repository;

import com.newhype.backend.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByEmail(String email);

    Optional<Tenant> findBySubdominio(String subdominio);

    boolean existsByEmail(String email);

    boolean existsBySubdominio(String subdominio);

    @Query("SELECT t FROM Tenant t WHERE t.estado <> 'ELIMINADA' AND " +
           "(:estado IS NULL OR t.estado = :estado) AND " +
           "(:q IS NULL OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(t.email) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(t.subdominio) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY t.createdAt DESC")
    Page<Tenant> buscar(@Param("estado") Tenant.EstadoTenant estado,
                         @Param("q") String q,
                         Pageable pageable);

    long countByEstado(Tenant.EstadoTenant estado);

    List<Tenant> findByEstadoNot(Tenant.EstadoTenant estado);
}
