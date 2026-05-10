package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminOrderDTO;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin - Orders", description = "주문 관리 (ADMIN 권한 필요)")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "전체 주문 목록 조회")
    @GetMapping
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        List<AdminOrderDTO> orders = orderService.getAllOrders().stream()
                .map(AdminOrderDTO::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "주문 상세 조회")
    @GetMapping("/{orderId}")
    public ResponseEntity<AdminOrderDTO> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(AdminOrderDTO.from(orderService.getOrderDetail(orderId)));
    }

    @Operation(summary = "주문 상태 변경", description = "PENDING → ORDER → DELIVERING → DELIVERED 순서로 변경")
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "주문 취소 (어드민)")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
