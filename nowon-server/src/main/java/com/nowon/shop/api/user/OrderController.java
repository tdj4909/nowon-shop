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

@Tag(name = "Orders", description = "Order management — USER role required")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final com.nowon.shop.domain.member.repository.MemberRepository memberRepository;

    @Operation(summary = "Place an order", description = "Creates a new order for the authenticated user. Uses pessimistic locking to prevent overselling.")
    @PostMapping
    public ResponseEntity<Long> createOrder(
            @AuthenticationPrincipal String email,
            @RequestBody OrderCreateRequestDTO request
    ) {
        Long memberId = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."))
                .getId();
        Long orderId = orderService.createOrder(memberId, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(orderId);
    }

    @Operation(summary = "Get my orders", description = "Returns the order history of the authenticated user, sorted by most recent.")
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            @AuthenticationPrincipal String email
    ) {
        Long memberId = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."))
                .getId();
        List<OrderResponseDTO> orders = orderService.getOrdersByMember(memberId).stream()
                .map(OrderResponseDTO::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Get order detail")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetail(
            @Parameter(description = "Order ID") @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(OrderResponseDTO.from(orderService.getOrderDetail(orderId)));
    }

    @Operation(summary = "Cancel order", description = "Cancels an order. Only orders in PENDING or ORDER status can be cancelled.")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @Parameter(description = "Order ID") @PathVariable Long orderId
    ) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
