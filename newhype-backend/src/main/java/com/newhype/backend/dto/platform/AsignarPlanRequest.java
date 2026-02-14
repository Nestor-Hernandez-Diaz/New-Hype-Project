package com.newhype.backend.dto.platform;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignarPlanRequest {

    @NotNull(message = "El planId es obligatorio")
    private Long planId;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean autoRenovar;
}
