package com.newhype.backend.repository;

import com.newhype.backend.entity.ModuloSistema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuloSistemaRepository extends JpaRepository<ModuloSistema, Long> {

    List<ModuloSistema> findByEstadoTrueOrderByCodigoAsc();
}
