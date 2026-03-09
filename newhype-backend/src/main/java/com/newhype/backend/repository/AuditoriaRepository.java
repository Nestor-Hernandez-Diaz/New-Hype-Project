package com.newhype.backend.repository;

import com.newhype.backend.entity.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    @Query("SELECT a FROM Auditoria a WHERE a.tenantId = :tenantId " +
           "AND (:accion IS NULL OR a.accion = :accion) " +
           "AND (:usuarioId IS NULL OR a.usuarioId = :usuarioId) " +
           "AND (:desde IS NULL OR a.createdAt >= :desde) " +
           "AND (:hasta IS NULL OR a.createdAt <= :hasta) " +
           "ORDER BY a.createdAt DESC")
    Page<Auditoria> buscar(@Param("tenantId") Long tenantId,
                           @Param("accion") String accion,
                           @Param("usuarioId") Long usuarioId,
                           @Param("desde") LocalDateTime desde,
                           @Param("hasta") LocalDateTime hasta,
                           Pageable pageable);

    Page<Auditoria> findByTenantIdAndUsuarioIdOrderByCreatedAtDesc(
            Long tenantId, Long usuarioId, Pageable pageable);
}
