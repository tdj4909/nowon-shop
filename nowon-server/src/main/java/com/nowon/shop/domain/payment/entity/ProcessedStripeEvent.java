package com.nowon.shop.domain.payment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Stripe Webhook 이벤트의 중복 처리 방지용 이력 테이블
 *
 * Stripe는 동일한 이벤트를 여러 번 재전송할 수 있다 (네트워크 이슈 / 응답 지연 등).
 * eventId를 PK로 두고, 이미 처리된 이벤트는 skip 함으로써 멱등성을 보장한다.
 */
@Entity
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "processed_stripe_events")
public class ProcessedStripeEvent {

    /** Stripe 이벤트 ID (예: evt_1ABC...) — 자연키로 사용 */
    @Id
    @Column(length = 100)
    private String eventId;

    @Column(nullable = false, length = 50)
    private String eventType;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime processedAt;

    public ProcessedStripeEvent(String eventId, String eventType) {
        this.eventId = eventId;
        this.eventType = eventType;
    }
}
