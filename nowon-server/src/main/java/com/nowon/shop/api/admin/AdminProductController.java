package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin — Products", description = "Product management — ADMIN role required")
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @Operation(summary = "List all products")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminProductDTO>>> getProducts() {
        return ResponseEntity.ok(ApiResponse.ok(productService.findAllProductsForAdmin()));
    }

    @Operation(summary = "Get product")
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<AdminProductDTO>> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(productService.findProductForAdmin(productId)));
    }

    @Operation(summary = "Create product")
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createProduct(@Valid @RequestBody AdminProductDTO dto) {
        Long productId = productService.saveProductForAdmin(dto);
        return ResponseEntity.ok(ApiResponse.ok(productId, "상품이 등록되었습니다."));
    }

    @Operation(summary = "Update product")
    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody AdminProductDTO dto
    ) {
        productService.updateProduct(productId, dto);
        return ResponseEntity.ok(ApiResponse.ok("상품이 수정되었습니다."));
    }

    @Operation(summary = "Delete product")
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.ok("상품이 삭제되었습니다."));
    }
}
