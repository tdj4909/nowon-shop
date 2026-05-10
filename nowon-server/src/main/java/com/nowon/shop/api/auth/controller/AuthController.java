package com.nowon.shop.api.auth.controller;

import com.nowon.shop.api.auth.dto.LoginRequestDTO;
import com.nowon.shop.api.auth.dto.RegisterRequestDTO;
import com.nowon.shop.domain.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Auth", description = "User registration and login")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;

    @Operation(summary = "Register", description = "Register a new user account. Role is automatically set to USER.")
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequestDTO dto) {
        memberService.registerUser(dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Login", description = "Authenticate with email and password. Returns a JWT access token.")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        String token = memberService.login(dto);
        return ResponseEntity.ok(Map.of("accessToken", token));
    }
}
