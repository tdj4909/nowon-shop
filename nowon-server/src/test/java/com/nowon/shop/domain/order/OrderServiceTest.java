package com.nowon.shop.domain.order;

import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.entity.Role;
import com.nowon.shop.domain.member.repository.MemberRepository;
import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderItem;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.repository.OrderRepository;
import com.nowon.shop.domain.order.service.OrderService;
import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.entity.ProductStatus;
import com.nowon.shop.domain.product.repository.ProductRepository;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ProductRepository productRepository;

    // 테스트용 Member 생성 헬퍼
    private Member createMember() {
        return Member.builder()
                .email("test@test.com")
                .password("password")
                .name("테스터")
                .role(Role.USER)
                .status(MemberStatus.ACTIVE)
                .build();
    }

    // 테스트용 Product 생성 헬퍼
    private Product createProduct(int stock) {
        return Product.builder()
                .name("테스트 상품")
                .category("전자기기")
                .price(10000L)
                .stock(stock)
                .description("테스트 설명")
                .status(ProductStatus.SELL)
                .build();
    }

    @Test
    @DisplayName("주문 생성 - 정상")
    void createOrder_success() {
        // given
        Member member = createMember();
        Product product = createProduct(10);

        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(productRepository.findByIdWithLock(1L)).willReturn(Optional.of(product));
        given(orderRepository.save(any(Order.class))).willAnswer(i -> i.getArgument(0));

        // when
        orderService.createOrder(1L, 1L, 3);

        // then
        assertThat(product.getStock()).isEqualTo(7); // 재고 차감 확인
        verify(orderRepository).save(any(Order.class)); // save 호출 확인
    }

    @Test
    @DisplayName("주문 생성 - 재고 부족 시 예외 발생")
    void createOrder_outOfStock() {
        // given
        Member member = createMember();
        Product product = createProduct(2); // 재고 2개

        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(productRepository.findByIdWithLock(1L)).willReturn(Optional.of(product));

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(1L, 1L, 5)) // 5개 주문
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.PRODUCT_OUT_OF_STOCK.getMessage());
    }

    @Test
    @DisplayName("주문 생성 - 존재하지 않는 회원이면 예외 발생")
    void createOrder_memberNotFound() {
        // given
        given(memberRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(99L, 1L, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.MEMBER_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("주문 취소 - 배송 중 상태에서 취소 시 예외 발생")
    void cancelOrder_shippedCannotCancel() {
        // given
        Member member = createMember();
        Product product = createProduct(10);

        Order order = Order.builder()
                .member(member)
                .totalPrice(10000L)
                .build();
        order.updateStatus(OrderStatus.SHIPPED); // 배송 중으로 변경

        // OrderItem 추가 (취소 시 재고 복구 로직이 있어서 필요)
        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .orderPrice(10000L)
                .quantity(1)
                .build();
        order.getOrderItems().add(orderItem);

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));

        // when & then
        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.ORDER_CANNOT_CANCEL.getMessage());
    }

    @Test
    @DisplayName("주문 취소 - 결제 대기 상태에서 취소 성공 및 재고 복구")
    void cancelOrder_success() {
        // given
        Member member = createMember();
        Product product = createProduct(7); // 이미 3개 차감된 상태

        Order order = Order.builder()
                .member(member)
                .totalPrice(30000L)
                .build();

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .orderPrice(10000L)
                .quantity(3)
                .build();
        order.getOrderItems().add(orderItem);

        given(orderRepository.findById(1L)).willReturn(Optional.of(order));

        // when
        orderService.cancelOrder(1L);

        // then
        assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStock()).isEqualTo(10); // 재고 복구 확인
    }

    @Test
    @DisplayName("주문 상태 변경 - 존재하지 않는 주문이면 예외 발생")
    void updateOrderStatus_orderNotFound() {
        // given
        given(orderRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> orderService.updateOrderStatus(99L, OrderStatus.PAID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.ORDER_NOT_FOUND.getMessage());
    }
}
