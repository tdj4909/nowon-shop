package com.nowon.shop.domain.product.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProductStatus {
    SELL("판매 중"),
    SOLD_OUT("품절"),
    HIDE("숨김");

    private final String description;
}