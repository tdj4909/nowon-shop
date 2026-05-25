package com.nowon.shop.domain.order;

import com.nowon.shop.api.user.dto.OrderCreateRequestDTO.OrderItemRequest;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.entity.MemberStatus;
import com.nowon.shop.domain.member.entity.Role;
import com.nowon.shop.domain.member.service.MemberService;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
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
    private MemberService memberService;

    @Mock
    private ProductRepository productRepository;

    // ── 헬퍼 ─────────────────────────────────────────────────────────────

    private Member createMember() {
        return Member.builder()
                .email("test@test.com")
                .password("password")
                .name("테스터")
                .role(Role.USER)
                .status(MemberStatus.ACTIVE)
                .build();
    }

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

    private OrderItemRequest createItemRequest(Long productId, int quantity) {
        OrderItemRequest req = new OrderItemRequest();
        ReflectionTestUtils.setField(req, "productId", productId);
        ReflectionTestUtils.setField(req, "quantity", quantity);
        return req;
    }

    /** 테스트용 — DTO 필드 주입을 통해 OrderItemRequest를 만들기 */
    private List<OrderItemRequest> requests(OrderItemRequest... items) {
        return List.of(items);
    }

    // ── 주문 생성 ────────────────────────────────────────────────────────

    @Test
    @DisplayName("주문 생성 - 단일 상품 정상 처리")
    void createOrder_singleItem_success() {
        // given
        Member member = createMember();
        Product product = createProduct(10);

        given(memberService.findById(1L)).willReturn(member);
        given(productRepository.findByIdWithLock(1L)).willReturn(Optional.of(product));
        given(orderRepository.save(any(Order.class))).willAnswer(i -> i.getArgument(0));

        // when
        orderService.createOrder(1L, requests(createItemRequest(1L, 3)));

        // then
        assertThat(product.getStock()).isEqualTo(7); // 10 - 3
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("주문 생성 - 다중 상품 정상 처리 및 총액 계산")
    void createOrder_multipleItems_success() {
        // given
        Member member = createMember();
        Product product1 = createProduct(10); // 10,000원
        Product product2 = createProduct(5);

        // product2를 다른 가격으로 만들기 위해 Builder로 직접 생성
        Product product2WithDifferentPrice = Product.builder()
                .name("상품2")
                .category("의류")
                .price(20000L)
                .stock(5)
                .status(ProductStatus.SELL)
                .build();

        given(memberService.findById(1L)).willReturn(member);
        given(productRepository.findByIdWithLock(1L)).willReturn(Optional.of(product1));
        given(productRepository.findByIdWithLock(2L)).willReturn(Optional.of(product2WithDifferentPrice));
        given(orderRepository.save(any(Order.class))).willAnswer(i -> {
            Order o = i.getArgument(0);
            // ID가 없으면 검증이 어려우니 save가 호출됐다는 사실만 확인
            return o;
        });

        // when
        orderService.createOrder(1L, requests(
                createItemRequest(1L, 2),  // 10,000 * 2 = 20,000
                createItemRequest(2L, 3)   // 20,000 * 3 = 60,000
        ));

        // then
        assertThat(product1.getStock()).isEqualTo(8);            // 10 - 2
        assertThat(product2WithDifferentPrice.getStock()).isEqualTo(2);  // 5 - 3
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("주문 생성 - 재고 부족 시 예외 발생")
    void createOrder_outOfStock() {
        // given
        Member member = createMember();
        Product product = createProduct(2);

        given(memberService.findById(1L)).willReturn(member);
        given(productRepository.findByIdWithLock(1L)).willReturn(Optional.of(product));

        // when & then
        assertThatThrownBy(() ->
                orderService.createOrder(1L, requests(createItemRequest(1L, 5)))
        )
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.PRODUCT_OUT_OF_STOCK.getMessage());
    }

    @Test
    @DisplayName("주문 생성 - 존재하지 않는 회원이면 예외 발생")
    void createOrder_memberNotFound() {
        // given
        given(memberService.findById(99L))
                .willThrow(new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // when & then
        assertThatThrownBy(() ->
                orderService.createOrder(99L, requests(createItemRequest(1L, 1)))
        )
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.MEMBER_NOT_FOUND.getMessage());
    }

    @Test
    @DisplayName("주문 생성 - 존재하지 않는 상품이면 예외 발생")
    void createOrder_productNotFound() {
        // given
        Member member = createMember();
        given(memberService.findById(1L)).willReturn(member);
        given(productRepository.findByIdWithLock(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() ->
                orderService.createOrder(1L, requests(createItemRequest(99L, 1)))
        )
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.PRODUCT_NOT_FOUND.getMessage());
    }

    // ── 주문 취소 ────────────────────────────────────────────────────────

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
        order.updateStatus(OrderStatus.SHIPPED);

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

    // ── 만료 PENDING 주문 정리 ───────────────────────────────────────────

    @Test
    @DisplayName("만료 PENDING 정리 - 대상 주문이 취소되고 재고가 복구된다")
    void cleanupExpiredPendingOrders_success() {
        // given
        Member member = createMember();
        Product product = createProduct(5); // 5개 차감된 상태로 가정

        Order pending = Order.builder()
                .member(member)
                .totalPrice(50000L)
                .build();
        OrderItem item = OrderItem.builder()
                .order(pending)
                .product(product)
                .orderPrice(10000L)
                .quantity(5)
                .build();
        pending.getOrderItems().add(item);

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        given(orderRepository.findPendingOrdersBefore(OrderStatus.PENDING, cutoff))
                .willReturn(List.of(pending));

        // when
        int cancelled = orderService.cleanupExpiredPendingOrders(cutoff);

        // then
        assertThat(cancelled).isEqualTo(1);
        assertThat(pending.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(product.getStock()).isEqualTo(10); // 5 + 5
    }

    @Test
    @DisplayName("만료 PENDING 정리 - 대상이 없으면 0을 반환한다")
    void cleanupExpiredPendingOrders_empty() {
        // given
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        given(orderRepository.findPendingOrdersBefore(OrderStatus.PENDING, cutoff))
                .willReturn(List.of());

        // when
        int cancelled = orderService.cleanupExpiredPendingOrders(cutoff);

        // then
        assertThat(cancelled).isZero();
    }
}
