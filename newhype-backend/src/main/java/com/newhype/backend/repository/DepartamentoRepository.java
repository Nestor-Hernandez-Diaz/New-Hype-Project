package com.newhype.backend.repository;

import com.newhype.backend.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {

    List<Departamento> findAllByOrderByNombreAsc();
}
