package com.newhype.backend.repository;

import com.newhype.backend.entity.DetalleTransferencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleTransferenciaRepository extends JpaRepository<DetalleTransferencia, Long> {

    List<DetalleTransferencia> findByTransferenciaId(Long transferenciaId);
}
