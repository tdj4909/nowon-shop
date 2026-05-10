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

@Tag(name = "Auth", description = "회원가입 / 로그인")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;

    @Operation(summary = "회원가입", description = "이메일, 이름, 비밀번호로 일반 회원 가입 (role 자동 USER)")
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequestDTO dto) {
        memberService.registerUser(dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "로그인", description = "이메일/비밀번호로 로그인 후 JWT 토큰 반환")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        String token = memberService.login(dto);
        return ResponseEntity.ok(Map.of("accessToken", token));
    }
}
