package com.nowon.shop.domain.payment.repository;

import com.nowon.shop.domain.payment.entity.ProcessedStripeEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessedStripeEventRepository extends JpaRepository<ProcessedStripeEvent, String> {
}
