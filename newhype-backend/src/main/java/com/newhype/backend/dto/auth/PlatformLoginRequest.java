package com.newhype.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformLoginRequest {

    @NotBlank(message = "El email o username es obligatorio")
    private String emailOrUsername;

    @NotBlank(message = "El password es obligatorio")
    private String password;
}
