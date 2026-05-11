package com.nowon.shop.api.admin.dto;

import com.nowon.shop.domain.product.entity.ProductStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductDTO {
    private Long id;
    private String name;
    private String category;
    private Long price;
    private Integer stock;
    private String description;
    private String imageUrl;
    private ProductStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
}
