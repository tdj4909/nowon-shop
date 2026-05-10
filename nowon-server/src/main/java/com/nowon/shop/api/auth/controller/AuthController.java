package com.nowon.shop.api.auth.controller;

import com.nowon.shop.api.auth.dto.LoginRequestDTO;
import com.nowon.shop.api.auth.dto.RegisterRequestDTO;
import com.nowon.shop.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequestDTO dto) {
        memberService.registerUser(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        String token = memberService.login(dto);
        // 토큰을 JSON 형태로 반환
        return ResponseEntity.ok(Map.of("accessToken", token));
    }
}
