package com.newhype.backend.repository;

import com.newhype.backend.entity.Provincia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProvinciaRepository extends JpaRepository<Provincia, Long> {

    List<Provincia> findByDepartamentoIdOrderByNombreAsc(Long departamentoId);
}
