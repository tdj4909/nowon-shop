package com.nowon.shop.api.admin.dto;

import com.nowon.shop.domain.product.entity.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 어드민 상품 DTO.
 * 요청(생성/수정) 및 응답에 함께 사용된다.
 * 검증 어노테이션은 요청 시에만 동작하며, 응답에는 영향을 주지 않는다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductDTO {

    private Long id;

    @NotBlank(message = "상품명은 필수 입력값입니다.")
    @Size(max = 100, message = "상품명은 100자를 초과할 수 없습니다.")
    private String name;

    @Size(max = 50, message = "카테고리는 50자를 초과할 수 없습니다.")
    private String category;

    @NotNull(message = "가격은 필수 입력값입니다.")
    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    private Long price;

    @NotNull(message = "재고는 필수 입력값입니다.")
    @Min(value = 0, message = "재고는 0 이상이어야 합니다.")
    private Integer stock;

    @Size(max = 2000, message = "상품 설명은 2000자를 초과할 수 없습니다.")
    private String description;

    @Size(max = 500, message = "이미지 URL은 500자를 초과할 수 없습니다.")
    private String imageUrl;

    private ProductStatus status;

    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
}
