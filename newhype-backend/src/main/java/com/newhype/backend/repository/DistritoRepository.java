package com.newhype.backend.repository;

import com.newhype.backend.entity.Distrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DistritoRepository extends JpaRepository<Distrito, Long> {

    List<Distrito> findByProvinciaIdOrderByNombreAsc(Long provinciaId);
}
