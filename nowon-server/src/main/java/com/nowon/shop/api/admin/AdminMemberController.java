package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.service.MemberService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin — Members", description = "Member management — ADMIN role required")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final MemberService memberService;

    @Operation(summary = "Create member", description = "Creates a member with a manually specified role.")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody AdminMemberDTO dto) {
        memberService.register(dto);
        return ResponseEntity.ok(ApiResponse.ok("회원이 등록되었습니다."));
    }

    @Operation(summary = "List all members")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminMemberDTO>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(memberService.findAllMembers()));
    }

    @Operation(summary = "Update member status", description = "Changes a member's status to ACTIVE, BLOCKED, or WITHDRAWN.")
    @PatchMapping("/{memberId}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long memberId,
            @RequestParam MemberStatus status
    ) {
        memberService.updateMemberStatus(memberId, status);
        return ResponseEntity.ok(ApiResponse.ok("회원 상태가 변경되었습니다."));
    }
}
