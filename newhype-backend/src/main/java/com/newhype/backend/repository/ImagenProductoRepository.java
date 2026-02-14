package com.newhype.backend.repository;

import com.newhype.backend.entity.ImagenProducto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {

    List<ImagenProducto> findByProductoIdOrderByOrdenAsc(Long productoId);

    Optional<ImagenProducto> findByIdAndProductoId(Long id, Long productoId);
}
