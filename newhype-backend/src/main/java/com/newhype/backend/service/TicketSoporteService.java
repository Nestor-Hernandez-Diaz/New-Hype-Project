package com.newhype.backend.service;

import com.newhype.backend.dto.platform.*;
import com.newhype.backend.dto.soporte.*;
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
import java.util.List;

@Service
public class TicketSoporteService {

    private final TicketSoporteRepository ticketRepository;
    private final RespuestaTicketRepository respuestaRepository;
    private final TenantRepository tenantRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioPlataformaRepository usuarioPlataformaRepository;
    private final AuditoriaPlataformaService auditoriaService;

    public TicketSoporteService(TicketSoporteRepository ticketRepository,
                                 RespuestaTicketRepository respuestaRepository,
                                 TenantRepository tenantRepository,
                                 UsuarioRepository usuarioRepository,
                                 UsuarioPlataformaRepository usuarioPlataformaRepository,
                                 AuditoriaPlataformaService auditoriaService) {
        this.ticketRepository = ticketRepository;
        this.respuestaRepository = respuestaRepository;
        this.tenantRepository = tenantRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioPlataformaRepository = usuarioPlataformaRepository;
        this.auditoriaService = auditoriaService;
    }

    // ── POST /soporte/tickets (tenant crea ticket) ──
    @Transactional
    public TicketResponse crear(CrearTicketRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long userId = TenantContext.getCurrentUserId();

        TicketSoporte.Prioridad prioridadEnum = TicketSoporte.Prioridad.MEDIA;
        if (request.getPrioridad() != null && !request.getPrioridad().isBlank()) {
            prioridadEnum = TicketSoporte.Prioridad.valueOf(request.getPrioridad());
        }

        TicketSoporte ticket = TicketSoporte.builder()
                .tenantId(tenantId)
                .usuarioId(userId)
                .asunto(request.getAsunto())
                .descripcion(request.getDescripcion())
                .prioridad(prioridadEnum)
                .build();

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    // ── GET /soporte/tickets (tenant lista sus tickets) ──
    @Transactional(readOnly = true)
    public Page<TicketResponse> listarPorTenant(int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Page<TicketSoporte> tickets = ticketRepository.findByTenantIdOrderByCreatedAtDesc(
                tenantId, PageRequest.of(page, size));
        return tickets.map(this::toResponse);
    }

    // ── GET /soporte/tickets/{id} (tenant ve detalle con respuestas) ──
    @Transactional(readOnly = true)
    public TicketResponse obtenerPorIdTenant(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        TicketSoporte ticket = ticketRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        return toResponseConRespuestas(ticket);
    }

    // ── GET /platform/tickets (SA lista todos - ya existente) ──
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

    // ── GET /platform/tickets/{id} (SA ve detalle - ya existente, ahora con respuestas) ──
    @Transactional(readOnly = true)
    public TicketResponse obtenerPorId(Long id) {
        TicketSoporte ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        return toResponseConRespuestas(ticket);
    }

    // ── PATCH /platform/tickets/{id} (SA actualiza estado/prioridad - ya existente) ──
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

        return toResponseConRespuestas(ticket);
    }

    // ── POST /platform/tickets/{id}/respuestas  Y  POST /soporte/tickets/{id}/respuestas ──
    @Transactional
    public TicketResponse agregarRespuesta(Long ticketId, CrearRespuestaTicketRequest request) {
        String scope = TenantContext.getCurrentScope();
        TicketSoporte ticket;

        if ("platform".equals(scope)) {
            ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        } else {
            Long tenantId = TenantContext.getCurrentTenantId();
            ticket = ticketRepository.findByIdAndTenantId(ticketId, tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        }

        if (ticket.getEstado() == TicketSoporte.EstadoTicket.CERRADO) {
            throw new IllegalArgumentException("No se puede responder a un ticket cerrado");
        }

        RespuestaTicket.AutorTipo autorTipo = "platform".equals(scope)
                ? RespuestaTicket.AutorTipo.PLATFORM
                : RespuestaTicket.AutorTipo.TENANT;

        RespuestaTicket respuesta = RespuestaTicket.builder()
                .ticketId(ticketId)
                .autorTipo(autorTipo)
                .autorId(TenantContext.getCurrentUserId())
                .mensaje(request.getMensaje())
                .build();

        respuestaRepository.save(respuesta);

        // Side effects when platform responds
        if (autorTipo == RespuestaTicket.AutorTipo.PLATFORM) {
            ticket.setRespuesta(request.getMensaje());
            ticket.setFechaRespuesta(LocalDateTime.now());
            ticket.setUsuarioPlataformaId(TenantContext.getCurrentUserId());
            if (ticket.getEstado() == TicketSoporte.EstadoTicket.ABIERTO) {
                ticket.setEstado(TicketSoporte.EstadoTicket.EN_PROCESO);
            }
            ticketRepository.save(ticket);
        }

        return toResponseConRespuestas(ticket);
    }

    // ── Mappers ──

    private TicketResponse toResponse(TicketSoporte ticket) {
        String tenantNombre = resolverTenantNombre(ticket.getTenantId());
        String atendidoPor = resolverPlataformaNombre(ticket.getUsuarioPlataformaId());
        String usuarioNombre = resolverUsuarioNombre(ticket.getUsuarioId());

        return TicketResponse.builder()
                .id(ticket.getId())
                .tenantId(ticket.getTenantId())
                .tenantNombre(tenantNombre)
                .usuarioId(ticket.getUsuarioId())
                .usuarioNombre(usuarioNombre)
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

    private TicketResponse toResponseConRespuestas(TicketSoporte ticket) {
        TicketResponse response = toResponse(ticket);

        List<RespuestaTicket> respuestas = respuestaRepository
                .findByTicketIdOrderByCreatedAtAsc(ticket.getId());

        List<RespuestaTicketResponse> respuestasDtos = respuestas.stream().map(r -> {
            String autorNombre;
            if (r.getAutorTipo() == RespuestaTicket.AutorTipo.PLATFORM) {
                autorNombre = resolverPlataformaNombre(r.getAutorId());
            } else {
                autorNombre = resolverUsuarioNombre(r.getAutorId());
            }
            return RespuestaTicketResponse.builder()
                    .id(r.getId())
                    .ticketId(r.getTicketId())
                    .autorTipo(r.getAutorTipo().name())
                    .autorId(r.getAutorId())
                    .autorNombre(autorNombre)
                    .mensaje(r.getMensaje())
                    .createdAt(r.getCreatedAt())
                    .build();
        }).toList();

        response.setRespuestas(respuestasDtos);
        return response;
    }

    private String resolverTenantNombre(Long tenantId) {
        if (tenantId == null) return null;
        return tenantRepository.findById(tenantId)
                .map(Tenant::getNombre).orElse(null);
    }

    private String resolverPlataformaNombre(Long usuarioPlataformaId) {
        if (usuarioPlataformaId == null) return null;
        return usuarioPlataformaRepository.findById(usuarioPlataformaId)
                .map(UsuarioPlataforma::getNombreCompleto).orElse(null);
    }

    private String resolverUsuarioNombre(Long usuarioId) {
        if (usuarioId == null) return null;
        return usuarioRepository.findById(usuarioId)
                .map(u -> u.getNombre() + " " + u.getApellido()).orElse(null);
    }
}
