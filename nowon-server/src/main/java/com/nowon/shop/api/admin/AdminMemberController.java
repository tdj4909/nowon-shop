package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final MemberService memberService;

    // 회원 등록
    @PostMapping
    public ResponseEntity<String> register(@RequestBody AdminMemberDTO dto) {
        memberService.register(dto);
        return ResponseEntity.ok("회원 등록이 완료되었습니다.");
    }

    // 회원 목록 조회
    @GetMapping
    public ResponseEntity<List<AdminMemberDTO>> list() {
        return ResponseEntity.ok(memberService.findAllMembers());
    }

    // 회원 상태 변경 (차단 / 활성화 / 탈퇴 처리)
    @PatchMapping("/{memberId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long memberId,
            @RequestParam MemberStatus status
    ) {
        memberService.updateMemberStatus(memberId, status);
        return ResponseEntity.ok().build();
    }
}
