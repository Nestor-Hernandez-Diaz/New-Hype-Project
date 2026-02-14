package com.newhype.backend.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagenResponse {

    private Long id;
    private Long productoId;
    private String url;
    private String altText;
    private Integer orden;
    private Boolean esPrincipal;
    private LocalDateTime createdAt;
}
