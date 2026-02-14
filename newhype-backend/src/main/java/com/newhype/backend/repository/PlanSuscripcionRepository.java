package com.newhype.backend.repository;

import com.newhype.backend.entity.PlanSuscripcion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanSuscripcionRepository extends JpaRepository<PlanSuscripcion, Long> {

    List<PlanSuscripcion> findAllByOrderByCreatedAtDesc();

    List<PlanSuscripcion> findByEstadoTrueOrderByPrecioMensualAsc();

    boolean existsByNombre(String nombre);
}
