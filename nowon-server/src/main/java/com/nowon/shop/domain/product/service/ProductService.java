package com.nowon.shop.domain.product.service;

import com.nowon.shop.domain.product.entity.Product;
import org.jspecify.annotations.Nullable;

import java.util.ArrayList;
import java.util.List;

public class ProductService {
    public @Nullable List<Product> findAll() {
        return new ArrayList<>();
    }

    public @Nullable Product save(Product product) {
        return new Product();
    }
}
