package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminOrderDTO;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.service.OrderService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin — Orders", description = "Order management — ADMIN role required")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "List all orders")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminOrderDTO>>> getAllOrders() {
        List<AdminOrderDTO> orders = orderService.getAllOrders().stream()
                .map(AdminOrderDTO::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @Operation(summary = "Get order detail")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<AdminOrderDTO>> getOrderDetail(@PathVariable Long orderId) {
        AdminOrderDTO order = AdminOrderDTO.from(orderService.getOrderDetail(orderId));
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @Operation(summary = "Update order status", description = "Progresses an order through statuses: PENDING → ORDER → DELIVERING → COMPLETE.")
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<Void>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.ok("주문 상태가 변경되었습니다."));
    }

    @Operation(summary = "Cancel order")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok(ApiResponse.ok("주문이 취소되었습니다."));
    }
}
