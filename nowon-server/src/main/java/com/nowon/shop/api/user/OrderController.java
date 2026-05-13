package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.OrderCreateRequestDTO;
import com.nowon.shop.api.user.dto.OrderResponseDTO;
import com.nowon.shop.domain.member.repository.MemberRepository;
import com.nowon.shop.domain.order.service.OrderService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Orders", description = "Order management — USER role required")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final MemberRepository memberRepository;

    @Operation(summary = "Place an order", description = "Creates a new order for the authenticated user. Uses pessimistic locking to prevent overselling.")
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createOrder(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody OrderCreateRequestDTO request
    ) {
        Long memberId = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."))
                .getId();
        Long orderId = orderService.createOrder(memberId, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(ApiResponse.ok(orderId, "주문이 완료되었습니다."));
    }

    @Operation(summary = "Get my orders", description = "Returns the order history of the authenticated user, sorted by most recent.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getMyOrders(
            @AuthenticationPrincipal String email
    ) {
        Long memberId = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."))
                .getId();
        List<OrderResponseDTO> orders = orderService.getOrdersByMember(memberId).stream()
                .map(OrderResponseDTO::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @Operation(summary = "Get order detail")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderDetail(
            @Parameter(description = "Order ID") @PathVariable Long orderId
    ) {
        OrderResponseDTO order = OrderResponseDTO.from(orderService.getOrderDetail(orderId));
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @Operation(summary = "Cancel order", description = "Cancels an order. Only orders in PENDING or ORDER status can be cancelled.")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @Parameter(description = "Order ID") @PathVariable Long orderId
    ) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok(ApiResponse.ok("주문이 취소되었습니다."));
    }
}
