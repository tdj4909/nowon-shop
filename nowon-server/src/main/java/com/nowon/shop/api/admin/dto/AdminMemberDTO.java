package com.nowon.shop.api.admin.dto;

import com.nowon.shop.domain.member.entity.Role;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMemberDTO {
    private String email;
    private String password;
    private String name;
    private Role role; // 관리자가 USER 또는 ADMIN 선택
}
