package com.newhype.backend.repository;

import com.newhype.backend.entity.MovimientoCaja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {

    List<MovimientoCaja> findBySesionCajaIdOrderByCreatedAtDesc(Long sesionCajaId);
}
