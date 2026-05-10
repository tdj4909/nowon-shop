package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public ResponseEntity<List<AdminProductDTO>> getProducts() {
        return ResponseEntity.ok(productService.findAllProductsForAdmin());
    }

    @Operation(summary = "Get product")
    @GetMapping("/{productId}")
    public ResponseEntity<AdminProductDTO> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.findProductForAdmin(productId));
    }

    @Operation(summary = "Create product")
    @PostMapping
    public ResponseEntity<Long> createProduct(@RequestBody AdminProductDTO dto) {
        return ResponseEntity.ok(productService.saveProductForAdmin(dto));
    }

    @Operation(summary = "Update product")
    @PutMapping("/{productId}")
    public ResponseEntity<Void> updateProduct(@PathVariable Long productId, @RequestBody AdminProductDTO dto) {
        productService.updateProduct(productId, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Delete product")
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok().build();
    }
}
