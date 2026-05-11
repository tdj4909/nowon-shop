package com.nowon.shop.api.user.dto;

import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.entity.ProductStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProductDTO {

    private Long id;
    private String name;
    private String category;
    private Long price;
    private Integer stock;
    private String description;
    private String imageUrl;
    private ProductStatus status;

    public static UserProductDTO from(Product product) {
        return UserProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .stock(product.getStock())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .build();
    }
}
