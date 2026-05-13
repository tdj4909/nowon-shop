package com.nowon.shop.api.auth.controller;

import com.nowon.shop.api.auth.dto.LoginRequestDTO;
import com.nowon.shop.api.auth.dto.LoginResponseDTO;
import com.nowon.shop.api.auth.dto.RegisterRequestDTO;
import com.nowon.shop.domain.member.service.MemberService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "User registration and login")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;

    @Operation(summary = "Register", description = "Register a new user account. Role is automatically set to USER.")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequestDTO dto) {
        memberService.registerUser(dto);
        return ResponseEntity.ok(ApiResponse.ok("회원가입이 완료되었습니다."));
    }

    @Operation(summary = "Login", description = "Authenticate with email and password. Returns a JWT access token.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO dto) {
        String token = memberService.login(dto);
        return ResponseEntity.ok(ApiResponse.ok(LoginResponseDTO.of(token)));
    }
}
