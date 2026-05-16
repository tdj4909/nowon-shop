package com.nowon.shop.domain.order.service;

import com.nowon.shop.api.user.dto.OrderCreateRequestDTO;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.service.MemberService;
import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderItem;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.repository.OrderRepository;
import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.repository.ProductRepository;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberService memberService;
    private final ProductRepository productRepository;

    // 주문 생성 (다중 상품 지원)
    @Transactional
    public Long createOrder(Long memberId, List<OrderCreateRequestDTO.OrderItemRequest> itemRequests) {

        Member member = memberService.findById(memberId);

        long totalPrice = 0L;

        // 주문 먼저 생성 (OrderItem 추가 전)
        Order order = Order.builder()
                .member(member)
                .totalPrice(0L) // 아래에서 계산 후 갱신
                .build();

        for (OrderCreateRequestDTO.OrderItemRequest req : itemRequests) {
            // 비관적 락으로 상품 조회 — 동시 주문 시 재고 정합성 보장
            Product product = productRepository.findByIdWithLock(req.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

            // 재고 차감 (재고 부족 시 Product 내부에서 예외 발생)
            product.removeStock(req.getQuantity());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .orderPrice(product.getPrice()) // 주문 당시 가격 스냅샷
                    .quantity(req.getQuantity())
                    .build();

            order.getOrderItems().add(orderItem);
            totalPrice += orderItem.getTotalPrice();
        }

        order.updateTotalPrice(totalPrice);

        return orderRepository.save(order).getId();
    }

    // 주문 취소
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

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
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        order.updateStatus(status);
    }

    // 특정 회원의 주문 목록 조회
    public List<Order> getOrdersByMember(Long memberId) {
        return orderRepository.findByMemberIdOrderByCreatedDateDesc(memberId);
    }

    // 주문 상세 조회
    public Order getOrderDetail(Long orderId) {
        return orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
    }

    // 전체 주문 목록 조회 (어드민용)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
