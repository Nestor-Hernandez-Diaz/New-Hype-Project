package com.newhype.backend.repository;

import com.newhype.backend.entity.Suscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SuscripcionRepository extends JpaRepository<Suscripcion, Long> {

    Optional<Suscripcion> findByTenantIdAndEstado(Long tenantId, Suscripcion.EstadoSuscripcion estado);

    Optional<Suscripcion> findFirstByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<Suscripcion> findByEstado(Suscripcion.EstadoSuscripcion estado);

    long countByPlanId(Long planId);

    @Query("SELECT s FROM Suscripcion s WHERE s.estado = 'ACTIVA' AND s.fechaFin BETWEEN :desde AND :hasta")
    List<Suscripcion> findActivasProximasAVencer(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT s FROM Suscripcion s WHERE s.estado = 'ACTIVA' AND s.fechaFin < :fecha")
    List<Suscripcion> findActivasVencidas(@Param("fecha") LocalDate fecha);
}
