package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminOrderDTO;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    // 전체 주문 목록 조회
    @GetMapping
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        List<AdminOrderDTO> orders = orderService.getAllOrders().stream()
                .map(AdminOrderDTO::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<AdminOrderDTO> getOrderDetail(@PathVariable Long orderId) {
        AdminOrderDTO order = AdminOrderDTO.from(orderService.getOrderDetail(orderId));
        return ResponseEntity.ok(order);
    }

    // 주문 상태 변경 (결제완료 → 배송중 → 배송완료 등)
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }

    // 주문 취소
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
