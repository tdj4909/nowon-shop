package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.OrderCreateRequestDTO;
import com.nowon.shop.api.user.dto.OrderResponseDTO;
import com.nowon.shop.domain.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Orders", description = "주문 관리 (USER 권한 필요)")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final com.nowon.shop.domain.member.repository.MemberRepository memberRepository;

    @Operation(summary = "주문 생성", description = "상품 ID와 수량으로 주문 생성. 비관적 락으로 재고 동시성 보장")
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

    @Operation(summary = "내 주문 목록 조회", description = "로그인한 사용자의 주문 목록 최신순 반환")
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

    @Operation(summary = "주문 상세 조회")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetail(
            @Parameter(description = "주문 ID") @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(OrderResponseDTO.from(orderService.getOrderDetail(orderId)));
    }

    @Operation(summary = "주문 취소", description = "PENDING/ORDER 상태의 주문만 취소 가능")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @Parameter(description = "주문 ID") @PathVariable Long orderId
    ) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
