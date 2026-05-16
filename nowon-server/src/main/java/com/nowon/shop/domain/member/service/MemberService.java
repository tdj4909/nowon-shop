package com.nowon.shop.domain.member.service;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.api.auth.dto.LoginRequestDTO;
import com.nowon.shop.api.auth.dto.RegisterRequestDTO;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.entity.Role;
import com.nowon.shop.domain.member.repository.MemberRepository;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import com.nowon.shop.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 유저 회원가입 (role 고정: USER)
    @Transactional
    public void registerUser(RegisterRequestDTO dto) {
        if (memberRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException(ErrorCode.MEMBER_EMAIL_DUPLICATED);
        }

        Member member = Member.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.USER)
                .build();

        memberRepository.save(member);
    }

    // 어드민용 회원 등록 (role 직접 지정)
    @Transactional
    public void register(AdminMemberDTO dto) {
        if (memberRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException(ErrorCode.MEMBER_EMAIL_DUPLICATED);
        }

        Member member = Member.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .build();

        memberRepository.save(member);
    }

    public List<AdminMemberDTO> findAllMembers() {
        return memberRepository.findAll().stream()
                .map(member -> AdminMemberDTO.builder()
                        .id(member.getId())
                        .email(member.getEmail())
                        .name(member.getName())
                        .role(member.getRole())
                        .status(member.getStatus())
                        .createdDate(member.getCreatedDate())
                        .build())
                .toList();
    }

    // ID로 Member 엔티티 조회 — OrderService 등 도메인 간 사용
    public Member findById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }

    // 이메일로 Member 엔티티 조회 — Controller에서 @AuthenticationPrincipal(email) 처리용
    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }

    @Transactional
    public void updateMemberStatus(Long memberId, MemberStatus status) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        member.updateStatus(status);
    }

    public String login(LoginRequestDTO dto) {
        Member member = memberRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (!passwordEncoder.matches(dto.getPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }

        return jwtTokenProvider.createToken(member.getEmail(), member.getRole().name());
    }
}
