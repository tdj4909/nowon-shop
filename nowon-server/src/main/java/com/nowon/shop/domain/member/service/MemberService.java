package com.nowon.shop.domain.member.service;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화 도구

    @Transactional
    public void register(AdminMemberDTO dto) {
        // 이메일 중복 체크
        if(memberRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }

        // 비밀번호 암호화 및 엔티티 생성
        Member member = Member.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .build();

        memberRepository.save(member);
    }

    // 전체 회원 목록 조회
    @Transactional(readOnly = true)
    public List<AdminMemberDTO> findAllMembers() {
        return memberRepository.findAll().stream()
                .map(member -> AdminMemberDTO.builder()
                        .id(member.getId())
                        .email(member.getEmail())
                        .name(member.getName())
                        .role(member.getRole())
                        .createdDate(member.getCreatedDate())
                        .build())
                .collect(Collectors.toList());
    }
}
