package com.newhype.backend.repository;

import com.newhype.backend.entity.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {

    List<Cupon> findAllByOrderByCreatedAtDesc();

    List<Cupon> findByEstadoTrueOrderByCreatedAtDesc();

    Optional<Cupon> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}
