package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin - Members", description = "회원 관리 (ADMIN 권한 필요)")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final MemberService memberService;

    @Operation(summary = "회원 등록 (어드민용)", description = "role을 직접 지정해서 회원 등록")
    @PostMapping
    public ResponseEntity<String> register(@RequestBody AdminMemberDTO dto) {
        memberService.register(dto);
        return ResponseEntity.ok("회원 등록이 완료되었습니다.");
    }

    @Operation(summary = "회원 목록 조회")
    @GetMapping
    public ResponseEntity<List<AdminMemberDTO>> list() {
        return ResponseEntity.ok(memberService.findAllMembers());
    }

    @Operation(summary = "회원 상태 변경", description = "ACTIVE / BLOCKED / WITHDRAWN 중 하나로 변경")
    @PatchMapping("/{memberId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long memberId,
            @RequestParam MemberStatus status
    ) {
        memberService.updateMemberStatus(memberId, status);
        return ResponseEntity.ok().build();
    }
}
