package com.nowon.shop.api.admin;

import com.nowon.shop.api.admin.dto.AdminProductDTO;
import com.nowon.shop.domain.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // 리액트 포트 허용 (CORS 해결)
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<AdminProductDTO>> getProducts() {
        List<AdminProductDTO> list = productService.findAllProductsForAdmin();
        System.out.println("데이터 확인: " + list); // 서버 콘솔에 리스트가 제대로 찍히는지 확인
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Long> createProduct(@RequestBody AdminProductDTO dto) {
        Long productId = productService.saveProductForAdmin(dto);
        return ResponseEntity.ok(productId);
    }
}