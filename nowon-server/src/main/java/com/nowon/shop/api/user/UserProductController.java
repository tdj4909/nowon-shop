package com.nowon.shop.api.user;

import com.nowon.shop.api.user.dto.UserProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import com.nowon.shop.global.common.ApiResponse;
import com.nowon.shop.global.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Products", description = "Product browsing — no authentication required")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;

    @Operation(summary = "List products", description = "Returns a paginated list of available products. Supports keyword search and category filter.")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserProductDTO>>> getProducts(
            @Parameter(description = "Search keyword (product name)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "8") int size
    ) {
        PageResponse<UserProductDTO> products = productService.findProductsForUser(keyword, category, page, size);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @Operation(summary = "List categories", description = "Returns a list of distinct categories for available products.")
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(productService.findCategoriesForUser()));
    }

    @Operation(summary = "Get product", description = "Returns the details of a single product by ID.")
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<UserProductDTO>> getProduct(
            @Parameter(description = "Product ID") @PathVariable Long productId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(productService.findProductForUser(productId)));
    }
}
