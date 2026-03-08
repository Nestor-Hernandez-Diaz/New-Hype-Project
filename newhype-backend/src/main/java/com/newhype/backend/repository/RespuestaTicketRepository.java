package com.newhype.backend.repository;

import com.newhype.backend.entity.RespuestaTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RespuestaTicketRepository extends JpaRepository<RespuestaTicket, Long> {

    List<RespuestaTicket> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    long countByTicketId(Long ticketId);
}
