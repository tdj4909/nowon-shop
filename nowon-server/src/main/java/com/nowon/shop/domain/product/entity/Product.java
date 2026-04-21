package com.nowon.shop.domain.product.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter // 실제 프로젝트에서는 Setter 대신 의미 있는 메서드(update 등)를 쓰는 게 더 안전하긴 합니다!
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(nullable = false)
    private Long price;

    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    @Builder // 모든 필드를 포함하도록 클래스 레벨이나 전체 생성자에 붙이는 것이 편합니다.
    public Product(String name, String category, Long price, Integer stock, String description, ProductStatus status) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.status = (status != null) ? status : ProductStatus.SELL; // null 방지
    }

    // 재고 감소 로직 (예시)
    public void removeStock(int quantity) {
        int restStock = this.stock - quantity;
        if (restStock < 0) {
            throw new RuntimeException("재고가 부족합니다."); // 커스텀 예외로 바꾸면 더 좋음
        }
        this.stock = restStock;
    }
}