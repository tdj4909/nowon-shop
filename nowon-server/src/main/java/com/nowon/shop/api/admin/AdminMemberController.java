package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminMemberDTO;
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

    @PostMapping
    public ResponseEntity<String> register(@RequestBody AdminMemberDTO dto) {
        memberService.register(dto);
        return ResponseEntity.ok("회원 등록이 완료되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<AdminMemberDTO>> list() {
        return ResponseEntity.ok(memberService.findAllMembers());
    }
}
