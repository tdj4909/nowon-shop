package com.nowon.shop.domain.payment.service;

import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.repository.OrderRepository;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    /**
     * PaymentIntent 생성 — 프론트에서 결제창을 띄우기 위한 clientSecret 반환
     * 원화(KRW)는 최소 화폐 단위가 원이므로 별도 변환 없이 그대로 사용
     */
    public String createPaymentIntent(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(order.getTotalPrice())
                    .setCurrency("krw")
                    .putMetadata("orderId", String.valueOf(orderId))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return intent.getClientSecret();

        } catch (StripeException e) {
            log.error("Stripe PaymentIntent 생성 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.PAYMENT_FAILED);
        }
    }

    /**
     * Stripe Webhook 처리 — 결제 완료 이벤트(payment_intent.succeeded) 수신 시
     * 서명 검증으로 위변조를 방지하고 주문 상태를 PAID로 업데이트
     */
    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe Webhook 서명 검증 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.PAYMENT_WEBHOOK_INVALID);
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow();

            String orderIdStr = intent.getMetadata().get("orderId");
            if (orderIdStr == null) return;

            Long orderId = Long.parseLong(orderIdStr);
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return;

            order.updateStatus(OrderStatus.PAID);
            log.info("결제 완료 — orderId: {}, amount: {}원", orderId, intent.getAmount());
        }
    }
}
