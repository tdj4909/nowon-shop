package com.nowon.shop.domain.member.service;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화 도구

    @Transactional
    public Long saveMember(AdminMemberDTO dto) {
        // 1. 이메일 중복 체크 (선택)
        if(memberRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }

        // 2. 비밀번호 암호화 및 엔티티 생성
        Member member = Member.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .password(passwordEncoder.encode(dto.getPassword())) // 암호화 핵심!
                .role(dto.getRole()) // 관리자 화면에선 Role 선택 가능
                .build();

        return memberRepository.save(member).getId();
    }
}
