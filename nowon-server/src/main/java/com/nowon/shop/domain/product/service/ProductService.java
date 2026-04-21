package com.nowon.shop.domain.product.service;

import com.nowon.shop.api.admin.dto.AdminProductDTO;
import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.entity.ProductStatus;
import com.nowon.shop.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public Long saveProductForAdmin(AdminProductDTO dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .description(dto.getDescription())
                .status(ProductStatus.SELL)
                .build();
        return productRepository.save(product).getId();
    }

    @Transactional(readOnly = true)
    public List<AdminProductDTO> findAllProductsForAdmin() {
        return productRepository.findAll().stream()
                .map(p -> AdminProductDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .category(p.getCategory())
                        .price(p.getPrice())
                        .stock(p.getStock())
                        .description(p.getDescription())
                        .status(p.getStatus())
                        .createdDate(p.getCreatedDate())
                        .lastModifiedDate(p.getLastModifiedDate())
                        .build())
                .collect(Collectors.toList());
    }
}
