package com.nowon.shop.domain.product.service;

import com.nowon.shop.api.admin.dto.AdminProductDTO;
import com.nowon.shop.api.user.dto.UserProductDTO;
import com.nowon.shop.domain.product.entity.Product;
import com.nowon.shop.domain.product.entity.ProductStatus;
import com.nowon.shop.domain.product.repository.ProductRepository;
import com.nowon.shop.global.common.PageResponse;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // ===== 유저용 API =====

    public PageResponse<UserProductDTO> findProductsForUser(
            String keyword, String category, int page, int size
    ) {
        // 빈 문자열은 null로 처리 (JPQL에서 :keyword IS NULL 조건 활용)
        String keywordParam = StringUtils.hasText(keyword) ? keyword : null;
        String categoryParam = StringUtils.hasText(category) ? category : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        Page<UserProductDTO> result = productRepository
                .findByStatusAndFilter(ProductStatus.SELL, keywordParam, categoryParam, pageable)
                .map(UserProductDTO::from);

        return new PageResponse<>(result);
    }

    public List<String> findCategoriesForUser() {
        return productRepository.findDistinctCategoriesByStatus(ProductStatus.SELL);
    }

    public UserProductDTO findProductForUser(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        if (product.getStatus() != ProductStatus.SELL) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        return UserProductDTO.from(product);
    }

    // ===== 어드민용 API =====

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
                .toList();
    }

    public AdminProductDTO findProductForAdmin(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        return AdminProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .stock(product.getStock())
                .description(product.getDescription())
                .status(product.getStatus())
                .createdDate(product.getCreatedDate())
                .lastModifiedDate(product.getLastModifiedDate())
                .build();
    }

    @Transactional
    public void updateProduct(Long productId, AdminProductDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        product.update(dto.getName(), dto.getCategory(), dto.getPrice(),
                dto.getStock(), dto.getDescription(), dto.getStatus());
    }

    @Transactional
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(productId);
    }
}
