package com.newhype.backend.repository;

import com.newhype.backend.entity.AuditoriaPlataforma;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditoriaPlataformaRepository extends JpaRepository<AuditoriaPlataforma, Long> {

    @Query("SELECT a FROM AuditoriaPlataforma a WHERE " +
           "(:tenantId IS NULL OR a.tenantId = :tenantId) AND " +
           "(:accion IS NULL OR a.accion = :accion) AND " +
           "(:desde IS NULL OR a.createdAt >= :desde) AND " +
           "(:hasta IS NULL OR a.createdAt <= :hasta) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditoriaPlataforma> buscar(@Param("tenantId") Long tenantId,
                                      @Param("accion") String accion,
                                      @Param("desde") LocalDateTime desde,
                                      @Param("hasta") LocalDateTime hasta,
                                      Pageable pageable);
}
