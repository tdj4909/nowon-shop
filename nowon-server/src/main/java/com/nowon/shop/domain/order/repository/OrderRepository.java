package com.nowon.shop.domain.order.repository;

import com.nowon.shop.domain.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 특정 회원의 주문 목록 (최신순)
    List<Order> findByMemberIdOrderByCreatedDateDesc(Long memberId);

    // 주문 상세 조회 시 OrderItem과 Product를 한 번에 조회 (N+1 문제 방지)
    @Query("SELECT o FROM Order o " +
            "JOIN FETCH o.orderItems oi " +
            "JOIN FETCH oi.product " +
            "WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
}
