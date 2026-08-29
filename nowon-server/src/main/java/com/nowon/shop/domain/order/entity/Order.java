package com.nowon.shop.domain.order.entity;

import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
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

    // 결제 성공 시 Stripe PaymentIntent id를 기록 — 이후 환불 요청에 사용한다.
    // 결제 전(PENDING) 주문과 이 필드 도입 이전에 결제된 주문은 null이다.
    @Column(length = 64)
    private String paymentIntentId;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @Builder
    public Order(Member member, Long totalPrice) {
        this.member = member;
        this.totalPrice = totalPrice;
        this.status = OrderStatus.PENDING;
    }

    // 주문 상태 변경
    public void updateStatus(OrderStatus status) {
        this.status = status;
    }

    /**
     * 결제 완료 처리 — 상태 변경과 PaymentIntent id 기록을 함께 수행한다.
     * 환불은 이 id가 있어야 가능하므로 PAID 전이는 반드시 이 메서드를 통한다.
     */
    public void markPaid(String paymentIntentId) {
        this.status = OrderStatus.PAID;
        this.paymentIntentId = paymentIntentId;
    }

    // 총액 확정 — 다중 상품 주문 시 OrderItem 추가 후 한 번에 갱신
    public void updateTotalPrice(long totalPrice) {
        this.totalPrice = totalPrice;
    }

    /**
     * 주문 취소 (취소 가능 상태 검증 포함)
     *
     * 이미 CANCELLED인 주문을 다시 취소하면 재고가 두 번 복구되어 재고가 부풀려진다.
     * (취소 요청 중복 클릭 / 동시 요청) 따라서 취소는 PENDING·PAID에서만 허용한다.
     */
    public void cancel() {
        if (this.status == OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }
        if (this.status == OrderStatus.SHIPPED || this.status == OrderStatus.DELIVERED) {
            throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL);
        }
        this.status = OrderStatus.CANCELLED;
    }

    /**
     * 주문에 묶인 재고를 상품으로 되돌린다.
     *
     * 취소 경로(사용자 취소 / 어드민 취소 / 만료 정리 / 결제 실패 Webhook)마다
     * 복구 로직을 복사하면 한 곳을 빠뜨리기 쉬우므로 엔티티에 모아 둔다.
     * 호출 측은 반드시 상태를 CANCELLED로 만든 뒤 한 번만 호출해야 한다.
     */
    public void restoreStock() {
        for (OrderItem item : orderItems) {
            item.getProduct().addStock(item.getQuantity());
        }
    }
}
