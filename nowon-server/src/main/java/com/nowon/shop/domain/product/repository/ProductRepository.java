package com.nowon.shop.domain.product.repository;

import com.nowon.shop.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // 기본적인 save, findAll, findById 등은 자동으로 생성됩니다.
}
