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

@Tag(name = "Admin — Orders", description = "Order management — ADMIN role required")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "List all orders")
    @GetMapping
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        List<AdminOrderDTO> orders = orderService.getAllOrders().stream()
                .map(AdminOrderDTO::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Get order detail")
    @GetMapping("/{orderId}")
    public ResponseEntity<AdminOrderDTO> getOrderDetail(@PathVariable Long orderId) {
        return ResponseEntity.ok(AdminOrderDTO.from(orderService.getOrderDetail(orderId)));
    }

    @Operation(summary = "Update order status", description = "Progresses an order through statuses: PENDING → ORDER → DELIVERING → COMPLETE.")
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cancel order")
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
