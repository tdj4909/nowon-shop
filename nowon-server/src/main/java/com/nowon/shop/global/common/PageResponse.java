package com.nowon.shop.global.common;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class PageResponse<T> {

    private final List<T> content;
    private final int page;        // 현재 페이지 (0-based)
    private final int size;        // 페이지 크기
    private final long totalElements; // 전체 데이터 수
    private final int totalPages;  // 전체 페이지 수
    private final boolean first;
    private final boolean last;

    public PageResponse(Page<T> page) {
        this.content = page.getContent();
        this.page = page.getNumber();
        this.size = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.first = page.isFirst();
        this.last = page.isLast();
    }
}
