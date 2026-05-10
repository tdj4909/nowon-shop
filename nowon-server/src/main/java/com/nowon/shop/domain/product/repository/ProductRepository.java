package com.nowon.shop.domain.product.repository;

import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.entity.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 주문 시 재고 차감에 사용 — 비관적 락으로 동시성 문제 방지
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :productId")
    Optional<Product> findByIdWithLock(@Param("productId") Long productId);

    // 유저용 상품 목록 — 검색 + 카테고리 필터 + 페이지네이션
    // keyword가 null이면 전체 조회, category가 null이면 전체 카테고리
    @Query("SELECT p FROM Product p " +
            "WHERE p.status = :status " +
            "AND (:keyword IS NULL OR p.name LIKE %:keyword%) " +
            "AND (:category IS NULL OR p.category = :category)")
    Page<Product> findByStatusAndFilter(
            @Param("status") ProductStatus status,
            @Param("keyword") String keyword,
            @Param("category") String category,
            Pageable pageable
    );

    // 카테고리 목록 조회 (중복 제거, SELL 상태만)
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.status = :status AND p.category IS NOT NULL")
    List<String> findDistinctCategoriesByStatus(@Param("status") ProductStatus status);
}
