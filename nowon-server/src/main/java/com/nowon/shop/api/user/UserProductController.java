package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.UserProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;

    // 상품 목록 조회 (인증 없이 접근 가능)
    @GetMapping
    public ResponseEntity<List<UserProductDTO>> getProducts() {
        return ResponseEntity.ok(productService.findAllProductsForUser());
    }

    // 상품 단건 조회 (인증 없이 접근 가능)
    @GetMapping("/{productId}")
    public ResponseEntity<UserProductDTO> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.findProductForUser(productId));
    }
}
