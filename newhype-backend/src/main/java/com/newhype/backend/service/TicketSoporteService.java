package com.newhype.backend.service;

import com.newhype.backend.dto.platform.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import com.newhype.backend.security.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TicketSoporteService {

    private final TicketSoporteRepository ticketRepository;
    private final TenantRepository tenantRepository;
    private final UsuarioPlataformaRepository usuarioPlataformaRepository;
    private final AuditoriaPlataformaService auditoriaService;

    public TicketSoporteService(TicketSoporteRepository ticketRepository,
                                 TenantRepository tenantRepository,
                                 UsuarioPlataformaRepository usuarioPlataformaRepository,
                                 AuditoriaPlataformaService auditoriaService) {
        this.ticketRepository = ticketRepository;
        this.tenantRepository = tenantRepository;
        this.usuarioPlataformaRepository = usuarioPlataformaRepository;
        this.auditoriaService = auditoriaService;
    }

    // ── GET /platform/tickets ──
    @Transactional(readOnly = true)
    public Page<TicketResponse> listar(String estado, String prioridad, Long tenantId, int page, int size) {
        TicketSoporte.EstadoTicket estadoEnum = null;
        TicketSoporte.Prioridad prioridadEnum = null;

        if (estado != null && !estado.isBlank()) {
            estadoEnum = TicketSoporte.EstadoTicket.valueOf(estado);
        }
        if (prioridad != null && !prioridad.isBlank()) {
            prioridadEnum = TicketSoporte.Prioridad.valueOf(prioridad);
        }

        Page<TicketSoporte> tickets = ticketRepository.buscar(estadoEnum, prioridadEnum, tenantId,
                PageRequest.of(page, size));

        return tickets.map(this::toResponse);
    }

    // ── GET /platform/tickets/{id} ──
    @Transactional(readOnly = true)
    public TicketResponse obtenerPorId(Long id) {
        TicketSoporte ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        return toResponse(ticket);
    }

    // ── PATCH /platform/tickets/{id} ──
    @Transactional
    public TicketResponse actualizar(Long id, ActualizarTicketRequest request, HttpServletRequest httpRequest) {
        TicketSoporte ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        if (request.getEstado() != null && !request.getEstado().isBlank()) {
            ticket.setEstado(TicketSoporte.EstadoTicket.valueOf(request.getEstado()));
        }
        if (request.getPrioridad() != null && !request.getPrioridad().isBlank()) {
            ticket.setPrioridad(TicketSoporte.Prioridad.valueOf(request.getPrioridad()));
        }
        if (request.getRespuesta() != null && !request.getRespuesta().isBlank()) {
            ticket.setRespuesta(request.getRespuesta());
            ticket.setFechaRespuesta(LocalDateTime.now());
            ticket.setUsuarioPlataformaId(TenantContext.getCurrentUserId());
            if (ticket.getEstado() == TicketSoporte.EstadoTicket.ABIERTO) {
                ticket.setEstado(TicketSoporte.EstadoTicket.EN_PROCESO);
            }
        }

        ticket = ticketRepository.save(ticket);

        auditoriaService.registrar("ACTUALIZAR_TICKET",
                "Ticket #" + id + " actualizado", ticket.getTenantId(), httpRequest);

        return toResponse(ticket);
    }

    private TicketResponse toResponse(TicketSoporte ticket) {
        String tenantNombre = null;
        if (ticket.getTenantId() != null) {
            tenantNombre = tenantRepository.findById(ticket.getTenantId())
                    .map(Tenant::getNombre).orElse(null);
        }

        String atendidoPor = null;
        if (ticket.getUsuarioPlataformaId() != null) {
            atendidoPor = usuarioPlataformaRepository.findById(ticket.getUsuarioPlataformaId())
                    .map(UsuarioPlataforma::getNombreCompleto).orElse(null);
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .tenantId(ticket.getTenantId())
                .tenantNombre(tenantNombre)
                .usuarioPlataformaId(ticket.getUsuarioPlataformaId())
                .atendidoPor(atendidoPor)
                .asunto(ticket.getAsunto())
                .descripcion(ticket.getDescripcion())
                .prioridad(ticket.getPrioridad() != null ? ticket.getPrioridad().name() : null)
                .estado(ticket.getEstado() != null ? ticket.getEstado().name() : null)
                .respuesta(ticket.getRespuesta())
                .fechaRespuesta(ticket.getFechaRespuesta())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
