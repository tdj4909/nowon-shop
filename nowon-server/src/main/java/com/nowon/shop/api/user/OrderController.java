package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.OrderCreateRequestDTO;
import com.nowon.shop.api.user.dto.OrderResponseDTO;
import com.nowon.shop.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final com.nowon.shop.domain.member.repository.MemberRepository memberRepository;

    // 주문 생성
    @PostMapping
    public ResponseEntity<Long> createOrder(
            @AuthenticationPrincipal String email,
            @RequestBody OrderCreateRequestDTO request
    ) {
        Long memberId = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."))
                .getId();

        Long orderId = orderService.createOrder(memberId, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(orderId);
    }

    // 내 주문 목록 조회
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            @AuthenticationPrincipal String email
    ) {
        Long memberId = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."))
                .getId();

        List<OrderResponseDTO> orders = orderService.getOrdersByMember(memberId).stream()
                .map(OrderResponseDTO::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetail(@PathVariable Long orderId) {
        OrderResponseDTO order = OrderResponseDTO.from(orderService.getOrderDetail(orderId));
        return ResponseEntity.ok(order);
    }

    // 주문 취소
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
