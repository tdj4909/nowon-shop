package com.nowon.shop.domain.order.repository;

import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 특정 회원의 주문 목록 (최신순, N+1 문제 방지)
    @Query("SELECT o FROM Order o " +
            "JOIN FETCH o.orderItems oi " +
            "JOIN FETCH oi.product " +
            "WHERE o.member.id = :memberId " +
            "ORDER BY o.createdDate DESC")
    List<Order> findByMemberIdOrderByCreatedDateDesc(@Param("memberId") Long memberId);

    // 주문 상세 조회 시 OrderItem과 Product를 한 번에 조회 (N+1 문제 방지)
    @Query("SELECT o FROM Order o " +
            "JOIN FETCH o.orderItems oi " +
            "JOIN FETCH oi.product " +
            "WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    /**
     * 만료된 PENDING 주문 조회 — 결제 미완료 주문 자동 취소 스케줄러용
     *
     * cutoff 시간 이전에 생성된 PENDING 상태 주문을 OrderItem/Product와 함께 fetch.
     * (재고 복구 시 LazyInitializationException 방지)
     */
    @Query("SELECT o FROM Order o " +
            "JOIN FETCH o.orderItems oi " +
            "JOIN FETCH oi.product " +
            "WHERE o.status = :status " +
            "AND o.createdDate < :cutoff")
    List<Order> findPendingOrdersBefore(
            @Param("status") OrderStatus status,
            @Param("cutoff") LocalDateTime cutoff
    );
}
