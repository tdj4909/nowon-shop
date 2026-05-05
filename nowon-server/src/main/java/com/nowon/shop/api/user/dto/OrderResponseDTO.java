package com.nowon.shop.api.user.dto;

import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponseDTO {

    private Long orderId;
    private Long totalPrice;
    private OrderStatus status;
    private String statusDescription;
    private LocalDateTime createdDate;
    private List<OrderItemDTO> orderItems;

    public static OrderResponseDTO from(Order order) {
        return OrderResponseDTO.builder()
                .orderId(order.getId())
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
        private String productName;
        private Long orderPrice;
        private Integer quantity;
        private Long totalPrice;

        public static OrderItemDTO from(com.nowon.shop.domain.order.entity.OrderItem item) {
            return OrderItemDTO.builder()
                    .productName(item.getProduct().getName())
                    .orderPrice(item.getOrderPrice())
                    .quantity(item.getQuantity())
                    .totalPrice(item.getTotalPrice())
                    .build();
        }
    }
}
