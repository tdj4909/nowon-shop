package com.nowon.shop.api.auth.dto;

import lombok.Getter;

@Getter
public class RegisterRequestDTO {
    private String email;
    private String name;
    private String password;
}
