package com.newhype.backend.repository;

import com.newhype.backend.entity.TicketSoporte;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketSoporteRepository extends JpaRepository<TicketSoporte, Long> {

    @Query("SELECT t FROM TicketSoporte t WHERE " +
           "(:estado IS NULL OR t.estado = :estado) AND " +
           "(:prioridad IS NULL OR t.prioridad = :prioridad) AND " +
           "(:tenantId IS NULL OR t.tenantId = :tenantId) " +
           "ORDER BY t.createdAt DESC")
    Page<TicketSoporte> buscar(@Param("estado") TicketSoporte.EstadoTicket estado,
                                @Param("prioridad") TicketSoporte.Prioridad prioridad,
                                @Param("tenantId") Long tenantId,
                                Pageable pageable);
}
