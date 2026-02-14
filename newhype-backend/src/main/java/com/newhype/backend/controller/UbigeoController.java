package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.configuracion.UbigeoResponse;
import com.newhype.backend.entity.Departamento;
import com.newhype.backend.entity.Provincia;
import com.newhype.backend.entity.Distrito;
import com.newhype.backend.repository.DepartamentoRepository;
import com.newhype.backend.repository.ProvinciaRepository;
import com.newhype.backend.repository.DistritoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ubigeo")
@Tag(name = "Ubigeo", description = "Datos geográficos del Perú (read-only)")
public class UbigeoController {

    private final DepartamentoRepository departamentoRepository;
    private final ProvinciaRepository provinciaRepository;
    private final DistritoRepository distritoRepository;

    public UbigeoController(DepartamentoRepository departamentoRepository,
                            ProvinciaRepository provinciaRepository,
                            DistritoRepository distritoRepository) {
        this.departamentoRepository = departamentoRepository;
        this.provinciaRepository = provinciaRepository;
        this.distritoRepository = distritoRepository;
    }

    @GetMapping("/departamentos")
    @Operation(summary = "Listar 25 departamentos del Perú")
    public ResponseEntity<ApiResponse<List<UbigeoResponse>>> listarDepartamentos() {
        List<UbigeoResponse> departamentos = departamentoRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(d -> UbigeoResponse.builder()
                        .id(d.getId())
                        .codigo(d.getCodigo())
                        .nombre(d.getNombre())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(departamentos));
    }

    @GetMapping("/provincias")
    @Operation(summary = "Listar provincias por departamento (?departamentoId=x)")
    public ResponseEntity<ApiResponse<List<UbigeoResponse>>> listarProvincias(
            @RequestParam Long departamentoId) {
        List<UbigeoResponse> provincias = provinciaRepository.findByDepartamentoIdOrderByNombreAsc(departamentoId)
                .stream()
                .map(p -> UbigeoResponse.builder()
                        .id(p.getId())
                        .codigo(p.getCodigo())
                        .nombre(p.getNombre())
                        .parentId(p.getDepartamentoId())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(provincias));
    }

    @GetMapping("/distritos")
    @Operation(summary = "Listar distritos por provincia (?provinciaId=x)")
    public ResponseEntity<ApiResponse<List<UbigeoResponse>>> listarDistritos(
            @RequestParam Long provinciaId) {
        List<UbigeoResponse> distritos = distritoRepository.findByProvinciaIdOrderByNombreAsc(provinciaId)
                .stream()
                .map(d -> UbigeoResponse.builder()
                        .id(d.getId())
                        .codigo(d.getCodigo())
                        .nombre(d.getNombre())
                        .parentId(d.getProvinciaId())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(distritos));
    }
}
