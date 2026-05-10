package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin - Products", description = "상품 관리 (ADMIN 권한 필요)")
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @Operation(summary = "상품 목록 조회")
    @GetMapping
    public ResponseEntity<List<AdminProductDTO>> getProducts() {
        return ResponseEntity.ok(productService.findAllProductsForAdmin());
    }

    @Operation(summary = "상품 단건 조회")
    @GetMapping("/{productId}")
    public ResponseEntity<AdminProductDTO> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.findProductForAdmin(productId));
    }

    @Operation(summary = "상품 등록")
    @PostMapping
    public ResponseEntity<Long> createProduct(@RequestBody AdminProductDTO dto) {
        return ResponseEntity.ok(productService.saveProductForAdmin(dto));
    }

    @Operation(summary = "상품 수정")
    @PutMapping("/{productId}")
    public ResponseEntity<Void> updateProduct(@PathVariable Long productId, @RequestBody AdminProductDTO dto) {
        productService.updateProduct(productId, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "상품 삭제")
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok().build();
    }
}
