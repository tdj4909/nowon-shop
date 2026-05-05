package com.nowon.shop.domain.member;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.api.auth.dto.LoginRequestDTO;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.entity.Role;
import com.nowon.shop.domain.member.repository.MemberRepository;
import com.nowon.shop.domain.member.service.MemberService;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import com.nowon.shop.global.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @InjectMocks
    private MemberService memberService;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("회원 가입 - 정상")
    void register_success() {
        // given
        AdminMemberDTO dto = AdminMemberDTO.builder()
                .email("new@test.com")
                .name("신규회원")
                .password("password123")
                .role(Role.USER)
                .build();

        given(memberRepository.findByEmail("new@test.com")).willReturn(Optional.empty());
        given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");

        // when
        memberService.register(dto);

        // then
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    @DisplayName("회원 가입 - 이메일 중복 시 예외 발생")
    void register_duplicatedEmail() {
        // given
        AdminMemberDTO dto = AdminMemberDTO.builder()
                .email("duplicate@test.com")
                .name("중복회원")
                .password("password123")
                .role(Role.USER)
                .build();

        Member existingMember = Member.builder()
                .email("duplicate@test.com")
                .name("기존회원")
                .password("encoded")
                .role(Role.USER)
                .status(MemberStatus.ACTIVE)
                .build();

        given(memberRepository.findByEmail("duplicate@test.com"))
                .willReturn(Optional.of(existingMember));

        // when & then
        assertThatThrownBy(() -> memberService.register(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.MEMBER_EMAIL_DUPLICATED.getMessage());

        verify(memberRepository, never()).save(any()); // save가 호출되지 않았는지 확인
    }

    @Test
    @DisplayName("로그인 - 정상")
    void login_success() {
        // given
        Member member = Member.builder()
                .email("test@test.com")
                .name("테스터")
                .password("encodedPassword")
                .role(Role.USER)
                .status(MemberStatus.ACTIVE)
                .build();

        LoginRequestDTO dto = new LoginRequestDTO("test@test.com", "rawPassword");

        given(memberRepository.findByEmail("test@test.com")).willReturn(Optional.of(member));
        given(passwordEncoder.matches("rawPassword", "encodedPassword")).willReturn(true);
        given(jwtTokenProvider.createToken(anyString(), anyString())).willReturn("jwt-token");

        // when
        String token = memberService.login(dto);

        // then
        assertThat(token).isEqualTo("jwt-token");
    }

    @Test
    @DisplayName("로그인 - 존재하지 않는 이메일이면 예외 발생")
    void login_memberNotFound() {
        // given
        LoginRequestDTO dto = new LoginRequestDTO("notexist@test.com", "password");
        given(memberRepository.findByEmail("notexist@test.com")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> memberService.login(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.MEMBER_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("로그인 - 비밀번호 불일치 시 예외 발생")
    void login_wrongPassword() {
        // given
        Member member = Member.builder()
                .email("test@test.com")
                .name("테스터")
                .password("encodedPassword")
                .role(Role.USER)
                .status(MemberStatus.ACTIVE)
                .build();

        LoginRequestDTO dto = new LoginRequestDTO("test@test.com", "wrongPassword");

        given(memberRepository.findByEmail("test@test.com")).willReturn(Optional.of(member));
        given(passwordEncoder.matches("wrongPassword", "encodedPassword")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> memberService.login(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.MEMBER_NOT_FOUND.getMessage()); // 보안상 동일 메시지
    }
}
