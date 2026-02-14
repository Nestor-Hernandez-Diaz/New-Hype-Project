package com.newhype.backend.repository;

import com.newhype.backend.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

    Optional<Usuario> findByTenantIdAndEmail(Long tenantId, String email);

    Optional<Usuario> findByTenantIdAndUsername(Long tenantId, String username);

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndEmail(Long tenantId, String email);

    boolean existsByTenantIdAndUsername(Long tenantId, String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM Usuario u WHERE u.tenantId = :tenantId " +
           "AND (:rolId IS NULL OR u.rolId = :rolId) " +
           "AND (:estado IS NULL OR u.estado = :estado) " +
           "AND (:q IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<Usuario> buscar(@Param("tenantId") Long tenantId,
                         @Param("rolId") Long rolId,
                         @Param("estado") Boolean estado,
                         @Param("q") String q,
                         Pageable pageable);

    long countByTenantIdAndRolId(Long tenantId, Long rolId);
}
