package com.nowon.shop.domain.order.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
    PENDING("결제 대기"),
    PAID("결제 완료"),
    SHIPPED("배송 중"),
    DELIVERED("배송 완료"),
    CANCELLED("취소");

    private final String description;
}
