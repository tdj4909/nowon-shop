package com.nowon.shop.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    // application.yaml에 설정할 비밀키 (최소 32자 이상의 임의 문자열)
    @Value("${jwt.secret}")
    private String salt;

    private SecretKey secretKey;

    // 토큰 유효시간 (1시간)
    private final long tokenValidTime = 1000L * 60 * 60;

    @PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(salt.getBytes(StandardCharsets.UTF_8));
    }

    // 토큰 생성 로직
    public String createToken(String email, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email) // 토큰 제목
                .claim("role", role) // 커스텀 클레임 (권한 등)
                .issuedAt(now) // 발행 시간
                .expiration(new Date(now.getTime() + tokenValidTime)) // 만료 시간
                .signWith(secretKey) // 암호화 알고리즘은 signWith가 자동으로 선택(HS256 등)
                .compact();
    }

    // 토큰에서 인증 정보 조회
    public Authentication getAuthentication(String token) {
        // 토큰 복호화 및 클레임 추출
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String email = claims.getSubject();
        String role = claims.get("role", String.class); // 토큰에 저장된 role 꺼내기

        // Spring Security의 hasRole("ADMIN") 등은 내부적으로 "ROLE_" 접두사를 검사합니다.
        // 따라서 권한을 등록할 때 "ROLE_"을 붙여서 SimpleGrantedAuthority를 생성합니다.
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

        return new UsernamePasswordAuthenticationToken(email, "", authorities);
    }

    // 토큰의 유효성 + 만료일자 확인
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}