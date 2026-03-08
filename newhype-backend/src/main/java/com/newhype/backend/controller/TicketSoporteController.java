package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.platform.TicketResponse;
import com.newhype.backend.dto.soporte.CrearRespuestaTicketRequest;
import com.newhype.backend.dto.soporte.CrearTicketRequest;
import com.newhype.backend.service.TicketSoporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/soporte/tickets")
@Tag(name = "Soporte - Tickets", description = "Gestion de tickets de soporte (lado tenant)")
public class TicketSoporteController {

    private final TicketSoporteService ticketService;

    public TicketSoporteController(TicketSoporteService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @Operation(summary = "Crear ticket de soporte")
    public ResponseEntity<ApiResponse<TicketResponse>> crear(
            @Valid @RequestBody CrearTicketRequest request) {
        TicketResponse response = ticketService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Ticket creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar tickets del tenant actual")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = ticketService.listarPorTenant(page, size);
        return ResponseEntity.ok(ApiResponse.<List<TicketResponse>>builder()
                .success(true)
                .data(result.getContent())
                .pagination(ApiResponse.PaginationMeta.builder()
                        .page(page)
                        .size(size)
                        .totalElements(result.getTotalElements())
                        .totalPages(result.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle del ticket con conversacion")
    public ResponseEntity<ApiResponse<TicketResponse>> obtenerPorId(@PathVariable Long id) {
        TicketResponse response = ticketService.obtenerPorIdTenant(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/respuestas")
    @Operation(summary = "Agregar respuesta al ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> responder(
            @PathVariable Long id,
            @Valid @RequestBody CrearRespuestaTicketRequest request) {
        TicketResponse response = ticketService.agregarRespuesta(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Respuesta agregada", response));
    }
}
