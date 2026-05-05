package com.nowon.shop.api.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OrderCreateRequestDTO {

    private Long productId;
    private Integer quantity;
}
