package com.nowon.shop.domain.member.service;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.api.auth.dto.LoginRequestDTO;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.entity.MemberStatus;
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
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND); // 보안상 이메일/비번 오류를 동일 메시지로 처리
        }

        return jwtTokenProvider.createToken(member.getEmail(), member.getRole().name());
    }
}
