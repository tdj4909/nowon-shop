package com.nowon.shop.domain.order.scheduler;

import com.nowon.shop.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 만료된 PENDING 주문 자동 정리 스케줄러
 *
 * Stripe 결제 페이지에서 사용자가 이탈하거나, 네트워크 문제로 Webhook이 도달하지 않는 경우
 * PENDING 주문은 영구히 남으면서 재고를 점유한다. 일정 시간 경과 후 자동 취소하여
 * 재고를 복구함으로써 다른 사용자가 구매할 수 있도록 한다.
 *
 * 운영 환경에서는 트래픽 패턴에 따라 ttl-minutes를 조정한다 (기본 30분).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PendingOrderCleanupScheduler {

    private final OrderService orderService;

    @Value("${order.pending.ttl-minutes:30}")
    private long ttlMinutes;

    /**
     * 5분마다 만료된 PENDING 주문 정리
     *
     * fixedDelay: 이전 실행 종료 후 5분 뒤 다음 실행 시작 (실행 시간 누적 방지)
     */
    @Scheduled(fixedDelayString = "${order.pending.cleanup-interval-ms:300000}")
    public void cleanupExpiredPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(ttlMinutes);

        try {
            int cancelled = orderService.cleanupExpiredPendingOrders(cutoff);
            if (cancelled > 0) {
                log.info("PENDING 주문 정리 완료 — 취소된 주문 수: {} (cutoff: {})", cancelled, cutoff);
            }
        } catch (Exception e) {
            // 스케줄러는 예외로 중단되면 안 되므로 로깅만 하고 다음 주기를 기다린다
            log.error("PENDING 주문 정리 중 예외 발생", e);
        }
    }
}
