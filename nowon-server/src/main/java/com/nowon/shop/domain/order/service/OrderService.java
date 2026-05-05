package com.nowon.shop.domain.order.service;

import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.repository.MemberRepository;
import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderItem;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.repository.OrderRepository;
import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;

    // 주문 생성
    @Transactional
    public Long createOrder(Long memberId, Long productId, int quantity) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 비관적 락으로 상품 조회 — 동시 주문 시 재고 정합성 보장
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다."));

        // 재고 차감 (Product 내부 로직에서 재고 부족 시 예외 발생)
        product.removeStock(quantity);

        // 주문 총액 계산
        Long totalPrice = product.getPrice() * quantity;

        // 주문 생성
        Order order = Order.builder()
                .member(member)
                .totalPrice(totalPrice)
                .build();

        // 주문 상품 생성 및 연관관계 설정
        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .orderPrice(product.getPrice()) // 주문 당시 가격 저장
                .quantity(quantity)
                .build();

        order.getOrderItems().add(orderItem);

        // Order 저장 시 CascadeType.ALL로 OrderItem도 함께 저장됨
        return orderRepository.save(order).getId();
    }

    // 주문 취소
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));

        // 취소 가능 상태 검증은 Order 엔티티 내부에서 처리
        order.cancel();

        // 재고 복구
        for (OrderItem item : order.getOrderItems()) {
            item.getProduct().addStock(item.getQuantity());
        }
    }

    // 주문 상태 변경 (어드민용)
    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));
        order.updateStatus(status);
    }

    // 특정 회원의 주문 목록 조회
    public List<Order> getOrdersByMember(Long memberId) {
        return orderRepository.findByMemberIdOrderByCreatedDateDesc(memberId);
    }

    // 주문 상세 조회
    public Order getOrderDetail(Long orderId) {
        return orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));
    }

    // 전체 주문 목록 조회 (어드민용)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
