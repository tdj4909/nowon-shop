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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Slf4j
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

        // 데드락 예방 — 상품 락 획득 순서를 productId 오름차순으로 고정한다.
        // 정렬하지 않으면 (요청 A: 상품1→2, 요청 B: 상품2→1)처럼 엇갈린 순서로
        // PESSIMISTIC_WRITE 락을 잡다가 상호 대기(deadlock)에 빠질 수 있다.
        List<OrderCreateRequestDTO.OrderItemRequest> sortedRequests = itemRequests.stream()
                .sorted(Comparator.comparing(OrderCreateRequestDTO.OrderItemRequest::getProductId))
                .toList();

        for (OrderCreateRequestDTO.OrderItemRequest req : sortedRequests) {
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

    // 주문 취소 — 본인 주문만 취소 가능
    @Transactional
    public void cancelOrder(Long memberId, Long orderId) {
        Order order = getOwnedOrder(memberId, orderId);

        // 취소 가능 상태 검증은 Order 엔티티 내부에서 처리
        order.cancel();

        // 재고 복구
        for (OrderItem item : order.getOrderItems()) {
            item.getProduct().addStock(item.getQuantity());
        }
    }

    // 주문 취소 (어드민용) — 소유권 검증 없이 처리
    @Transactional
    public void cancelOrderByAdmin(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        order.cancel();

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

    // 주문 상세 조회 — 본인 주문만 조회 가능
    public Order getOrderDetail(Long memberId, Long orderId) {
        return getOwnedOrder(memberId, orderId);
    }

    // 주문 상세 조회 (어드민용) — 소유권 검증 없이 조회
    public Order getOrderDetailByAdmin(Long orderId) {
        return orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
    }

    // 전체 주문 목록 조회 (어드민용) — N+1 방지를 위해 fetch join 사용
    public List<Order> getAllOrders() {
        return orderRepository.findAllWithItems();
    }

    /**
     * 주문 조회 + 소유권 검증 공통 로직.
     * 주문이 존재하지 않으면 ORDER_NOT_FOUND, 요청자의 주문이 아니면 ORDER_FORBIDDEN.
     */
    private Order getOwnedOrder(Long memberId, Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ORDER_FORBIDDEN);
        }
        return order;
    }

    /**
     * 만료된 PENDING 주문 자동 취소 — 스케줄러에서 호출
     *
     * 결제 페이지에서 사용자가 이탈한 경우 PENDING 주문이 영구히 남으면서
     * 재고가 차감된 상태로 유지된다. cutoff 시간 이전에 생성된 PENDING 주문을
     * 일괄 취소하고 재고를 복구한다.
     *
     * @param cutoff 이 시각 이전에 생성된 PENDING 주문이 정리 대상
     * @return 취소된 주문 수
     */
    @Transactional
    public int cleanupExpiredPendingOrders(LocalDateTime cutoff) {
        List<Order> expired = orderRepository.findPendingOrdersBefore(OrderStatus.PENDING, cutoff);

        for (Order order : expired) {
            // Order.cancel()의 상태 검증을 거치지 않고 직접 처리
            // (PENDING 상태인 것을 이미 쿼리에서 보장했고, 검증 메서드를 우회할 사유가 명확)
            order.updateStatus(OrderStatus.CANCELLED);
            for (OrderItem item : order.getOrderItems()) {
                item.getProduct().addStock(item.getQuantity());
            }
            log.info("만료된 PENDING 주문 자동 취소 — orderId={}, createdDate={}",
                    order.getId(), order.getCreatedDate());
        }

        return expired.size();
    }
}
