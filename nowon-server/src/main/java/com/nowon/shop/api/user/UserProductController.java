package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.UserProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import com.nowon.shop.global.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Products", description = "상품 조회 (인증 불필요)")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;

    @Operation(summary = "상품 목록 조회", description = "키워드 검색, 카테고리 필터, 페이지네이션 지원")
    @GetMapping
    public ResponseEntity<PageResponse<UserProductDTO>> getProducts(
            @Parameter(description = "검색 키워드 (상품명)") @RequestParam(required = false) String keyword,
            @Parameter(description = "카테고리 필터") @RequestParam(required = false) String category,
            @Parameter(description = "페이지 번호 (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "8") int size
    ) {
        return ResponseEntity.ok(productService.findProductsForUser(keyword, category, page, size));
    }

    @Operation(summary = "카테고리 목록 조회", description = "판매 중인 상품의 카테고리 목록 반환")
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.findCategoriesForUser());
    }

    @Operation(summary = "상품 단건 조회", description = "상품 ID로 상세 정보 조회")
    @GetMapping("/{productId}")
    public ResponseEntity<UserProductDTO> getProduct(
            @Parameter(description = "상품 ID") @PathVariable Long productId
    ) {
        return ResponseEntity.ok(productService.findProductForUser(productId));
    }
}
