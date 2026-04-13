package com.nowon.shop.domain.product.service;

import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public @Nullable List<Product> findAll() {
        return productRepository.findAll();
    }

    public @Nullable Product save(Product product) {
        return productRepository.save(product);
    }
}
