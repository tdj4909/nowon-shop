package com.nowon.shop.domain.product;

import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.entity.ProductStatus;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class ProductTest {

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .name("테스트 상품")
                .category("전자기기")
                .price(10000L)
                .stock(10)
                .description("테스트 설명")
                .status(ProductStatus.SELL)
                .build();
    }

    @Test
    @DisplayName("재고 차감 - 정상")
    void removeStock_success() {
        // when
        product.removeStock(3);

        // then
        assertThat(product.getStock()).isEqualTo(7);
    }

    @Test
    @DisplayName("재고 차감 - 재고 부족 시 예외 발생")
    void removeStock_outOfStock() {
        // when & then
        assertThatThrownBy(() -> product.removeStock(11))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.PRODUCT_OUT_OF_STOCK.getMessage());
    }

    @Test
    @DisplayName("재고 복구 - 주문 취소 시 재고가 다시 증가")
    void addStock_success() {
        // given
        product.removeStock(3); // 재고: 7

        // when
        product.addStock(3); // 재고: 10

        // then
        assertThat(product.getStock()).isEqualTo(10);
    }
}
