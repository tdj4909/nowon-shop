package com.nowon.shop.api.admin.dto;

import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMemberDTO {
    private Long id;
    private String email;
    private String password;
    private String name;
    private Role role;
    private MemberStatus status;
    private LocalDateTime createdDate;
}
