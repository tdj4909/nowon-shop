package com.nowon.shop.domain.payment.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
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

import java.nio.charset.StandardCharsets;

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

    @Transactional
    public void handleWebhook(byte[] payload, String sigHeader) {
        String payloadStr = new String(payload, StandardCharsets.UTF_8);

        Event event;
        try {
            event = Webhook.constructEvent(payloadStr, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe Webhook 서명 검증 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.PAYMENT_WEBHOOK_INVALID);
        }

        // getDataObjectDeserializer()는 API 버전 불일치 시 비어있을 수 있으므로
        // raw JSON에서 직접 orderId를 추출 — API 버전에 무관하게 동작
        String orderIdStr = extractOrderIdFromRawJson(payloadStr);
        if (orderIdStr == null) {
            log.warn("Webhook에서 orderId를 찾을 수 없음: eventType={}", event.getType());
            return;
        }

        Long orderId = Long.parseLong(orderIdStr);

        switch (event.getType()) {
            case "payment_intent.succeeded" -> {
                updateOrderStatus(orderId, OrderStatus.PAID);
                log.info("결제 완료 — orderId: {}", orderId);
            }
            case "payment_intent.payment_failed" -> {
                updateOrderStatus(orderId, OrderStatus.CANCELLED);
                log.warn("결제 실패 — orderId: {}", orderId);
            }
            default -> log.debug("미처리 Webhook 이벤트: {}", event.getType());
        }
    }

    /**
     * raw JSON payload에서 data.object.metadata.orderId 추출
     * Stripe SDK의 getDataObjectDeserializer()는 API 버전이 SDK와 다를 때 비어있을 수 있음
     */
    private String extractOrderIdFromRawJson(String payloadStr) {
        try {
            JsonObject root = JsonParser.parseString(payloadStr).getAsJsonObject();
            JsonObject dataObject = root.getAsJsonObject("data").getAsJsonObject("object");
            JsonObject metadata = dataObject.getAsJsonObject("metadata");
            if (metadata == null || !metadata.has("orderId")) return null;
            return metadata.get("orderId").getAsString();
        } catch (Exception e) {
            log.error("Webhook JSON 파싱 실패: {}", e.getMessage());
            return null;
        }
    }

    private void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("Webhook — 주문을 찾을 수 없음: orderId={}", orderId);
            return;
        }
        order.updateStatus(status);
    }
}
