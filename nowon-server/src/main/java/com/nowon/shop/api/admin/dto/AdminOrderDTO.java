package com.nowon.shop.api.admin.dto;

import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminOrderDTO {

    private Long orderId;
    private Long memberId;
    private String memberName;
    private Long totalPrice;
    private OrderStatus status;
    private String statusDescription;
    private LocalDateTime createdDate;
    private List<OrderItemDTO> orderItems;

    public static AdminOrderDTO from(Order order) {
        return AdminOrderDTO.builder()
                .orderId(order.getId())
                .memberId(order.getMember().getId())
                .memberName(order.getMember().getName())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .statusDescription(order.getStatus().getDescription())
                .createdDate(order.getCreatedDate())
                .orderItems(
                        order.getOrderItems().stream()
                                .map(OrderItemDTO::from)
                                .toList()
                )
                .build();
    }

    @Getter
    @Builder
    public static class OrderItemDTO {
        private Long productId;
        private String productName;
        private Long orderPrice;
        private Integer quantity;
        private Long totalPrice;

        public static OrderItemDTO from(com.nowon.shop.domain.order.entity.OrderItem item) {
            return OrderItemDTO.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .orderPrice(item.getOrderPrice())
                    .quantity(item.getQuantity())
                    .totalPrice(item.getTotalPrice())
                    .build();
        }
    }
}
