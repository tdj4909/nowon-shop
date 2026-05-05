package com.nowon.shop.domain.order.entity;

import com.nowon.shop.domain.product.entity.Product;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 주문 당시 가격 저장 (나중에 상품 가격이 바뀌어도 주문 기록은 보존)
    @Column(nullable = false)
    private Long orderPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Builder
    public OrderItem(Order order, Product product, Long orderPrice, Integer quantity) {
        this.order = order;
        this.product = product;
        this.orderPrice = orderPrice;
        this.quantity = quantity;
    }

    // 소계 (단가 * 수량)
    public Long getTotalPrice() {
        return this.orderPrice * this.quantity;
    }
}
