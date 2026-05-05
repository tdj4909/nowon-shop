package com.nowon.shop.domain.order.entity;

import com.nowon.shop.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "orders") // order는 SQL 예약어라 복수형 사용
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // OrderItem을 Order가 관리 (CascadeType.ALL로 Order 저장 시 OrderItem도 함께 저장)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(nullable = false)
    private Long totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @Builder
    public Order(Member member, Long totalPrice) {
        this.member = member;
        this.totalPrice = totalPrice;
        this.status = OrderStatus.PENDING; // 주문 생성 시 기본값은 결제 대기
    }

    // 주문 상태 변경 (Setter 대신 의미 있는 메서드로)
    public void updateStatus(OrderStatus status) {
        this.status = status;
    }

    // 주문 취소 (취소 가능 상태 검증 포함)
    public void cancel() {
        if (this.status == OrderStatus.SHIPPED || this.status == OrderStatus.DELIVERED) {
            throw new IllegalStateException("배송 중이거나 배송 완료된 주문은 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELLED;
    }
}
