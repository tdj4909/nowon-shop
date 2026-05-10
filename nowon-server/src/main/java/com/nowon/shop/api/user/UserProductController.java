package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.UserProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import com.nowon.shop.global.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;

    // 상품 목록 조회 — 검색 + 카테고리 필터 + 페이지네이션 (인증 불필요)
    @GetMapping
    public ResponseEntity<PageResponse<UserProductDTO>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(productService.findProductsForUser(keyword, category, page, size));
    }

    // 카테고리 목록 조회 (필터 버튼용)
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.findCategoriesForUser());
    }

    // 상품 단건 조회 (인증 불필요)
    @GetMapping("/{productId}")
    public ResponseEntity<UserProductDTO> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.findProductForUser(productId));
    }
}
