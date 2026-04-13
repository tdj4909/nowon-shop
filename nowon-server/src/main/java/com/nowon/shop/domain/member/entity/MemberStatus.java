package com.nowon.shop.domain.member.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberStatus {
    ACTIVE("정상"),
    BANNED("차단"),
    WITHDRAWN("탈퇴");

    private final String title;
}
