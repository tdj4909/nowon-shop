package com.nowon.shop.api.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDTO {

    private final String accessToken;
    private final String tokenType;

    public static LoginResponseDTO of(String accessToken) {
        return LoginResponseDTO.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }
}
