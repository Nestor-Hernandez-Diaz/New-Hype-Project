package com.newhype.backend.repository;

import com.newhype.backend.entity.EntidadComercial;
import com.newhype.backend.entity.EntidadComercial.TipoEntidad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EntidadComercialRepository extends JpaRepository<EntidadComercial, Long> {

    Optional<EntidadComercial> findByIdAndTenantId(Long id, Long tenantId);

    Optional<EntidadComercial> findByTenantIdAndTipoDocumentoAndNumeroDocumento(
            Long tenantId, String tipoDocumento, String numeroDocumento);

    Optional<EntidadComercial> findByTenantIdAndEmail(Long tenantId, String email);

    boolean existsByTenantIdAndTipoDocumentoAndNumeroDocumento(
            Long tenantId, String tipoDocumento, String numeroDocumento);

    long countByTenantIdAndTipoEntidad(Long tenantId, TipoEntidad tipoEntidad);

    long countByTenantIdAndEstadoTrue(Long tenantId);

    long countByTenantIdAndCreatedAtAfter(Long tenantId, LocalDateTime fecha);

    @Query("SELECT e FROM EntidadComercial e WHERE e.tenantId = :tenantId AND e.estado = true " +
           "AND (:tipoEntidad IS NULL OR e.tipoEntidad = :tipoEntidad) " +
           "AND (:q IS NULL OR LOWER(e.nombres) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(e.apellidos) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(e.razonSocial) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR e.numeroDocumento LIKE CONCAT('%', :q, '%'))")
    Page<EntidadComercial> buscar(
            @Param("tenantId") Long tenantId,
            @Param("tipoEntidad") TipoEntidad tipoEntidad,
            @Param("q") String q,
            Pageable pageable);
}
