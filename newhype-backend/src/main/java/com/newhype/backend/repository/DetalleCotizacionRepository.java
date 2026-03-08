package com.newhype.backend.repository;

import com.newhype.backend.entity.DetalleCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleCotizacionRepository extends JpaRepository<DetalleCotizacion, Long> {

    List<DetalleCotizacion> findByCotizacionId(Long cotizacionId);
}
