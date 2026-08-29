package com.nowon.shop.domain.payment.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.nowon.shop.domain.member.entity.Member;
import com.nowon.shop.domain.member.repository.MemberRepository;
import com.nowon.shop.domain.order.entity.Order;
import com.nowon.shop.domain.order.entity.OrderStatus;
import com.nowon.shop.domain.order.repository.OrderRepository;
import com.nowon.shop.domain.payment.entity.ProcessedStripeEvent;
import com.nowon.shop.domain.payment.repository.ProcessedStripeEventRepository;
import com.nowon.shop.global.exception.BusinessException;
import com.nowon.shop.global.exception.ErrorCode;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final ProcessedStripeEventRepository processedEventRepository;
    private final MemberRepository memberRepository;

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public String createPaymentIntent(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 소유권 검증 — 다른 사용자의 주문으로 PaymentIntent를 생성하지 못하도록 차단
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        if (!order.getMember().getId().equals(member.getId())) {
            throw new BusinessException(ErrorCode.ORDER_FORBIDDEN);
        }

        // 결제 가능 상태 검증 — 이미 결제되었거나 취소된 주문은 재결제 불가
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(ErrorCode.PAYMENT_NOT_PAYABLE);
        }

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
     * Stripe 환불 요청 — 결제 완료 주문을 취소할 때 호출한다.
     *
     * 실패 시 예외를 던져 호출 측 트랜잭션을 롤백시킨다.
     * (환불되지 않은 주문이 CANCELLED로 커밋되는 상황을 막기 위함)
     */
    public void refund(String paymentIntentId) {
        if (!StringUtils.hasText(paymentIntentId)) {
            // 결제 수단 정보가 없으면 자동 환불이 불가능하므로, 조용히 취소시키지 않고 실패시킨다.
            log.error("환불 불가 — PaymentIntent id가 없는 결제 완료 주문");
            throw new BusinessException(ErrorCode.PAYMENT_REFUND_UNAVAILABLE);
        }

        try {
            Refund.create(RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .build());
            log.info("Stripe 환불 완료 — paymentIntentId={}", paymentIntentId);
        } catch (StripeException e) {
            log.error("Stripe 환불 실패 — paymentIntentId={}, message={}", paymentIntentId, e.getMessage());
            throw new BusinessException(ErrorCode.PAYMENT_REFUND_FAILED);
        }
    }

    /**
     * Stripe Webhook 처리 — 멱등성 보장
     *
     * Stripe는 동일 이벤트를 재전송할 수 있으므로 event.getId() 기반으로 중복 처리를 차단한다.
     * 이미 처리된 이벤트는 200 OK만 응답하고 비즈니스 로직은 실행하지 않는다.
     */
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

        // 멱등성 체크 — 이미 처리된 이벤트면 skip
        if (processedEventRepository.existsById(event.getId())) {
            log.info("이미 처리된 Stripe 이벤트 — skip. eventId={}, type={}",
                    event.getId(), event.getType());
            return;
        }

        // getDataObjectDeserializer()는 API 버전 불일치 시 비어있을 수 있으므로
        // raw JSON에서 직접 값을 추출 — API 버전에 무관하게 동작
        JsonObject dataObject = parseDataObject(payloadStr);
        String orderIdStr = extractOrderId(dataObject);
        if (orderIdStr == null) {
            log.warn("Webhook에서 orderId를 찾을 수 없음: eventType={}", event.getType());
            // orderId 없는 이벤트도 처리 이력에 남겨 재시도 방지
            saveProcessedEvent(event);
            return;
        }

        Long orderId = Long.parseLong(orderIdStr);

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSucceeded(orderId, extractPaymentIntentId(dataObject));
            case "payment_intent.payment_failed" -> handlePaymentFailed(orderId);
            default -> log.debug("미처리 Webhook 이벤트: {}", event.getType());
        }

        // 처리 이력 저장 — 같은 트랜잭션 안에서 함께 커밋됨
        saveProcessedEvent(event);
    }

    /**
     * 결제 성공 처리 — 현재 상태를 확인한 뒤에만 전이한다.
     *
     * 무조건 PAID로 덮어쓰면, 만료 정리 스케줄러가 이미 취소하고 재고까지 되돌린 주문이
     * 뒤늦게 도착한 결제로 되살아나 대금은 받았는데 재고는 이중 계상된 주문이 된다.
     * 이미 취소된 주문은 이행할 수 없으므로 즉시 환불한다.
     */
    private void handlePaymentSucceeded(Long orderId, String paymentIntentId) {
        Order order = orderRepository.findByIdWithItems(orderId).orElse(null);
        if (order == null) {
            log.warn("Webhook — 주문을 찾을 수 없음: orderId={}", orderId);
            return;
        }

        switch (order.getStatus()) {
            case PENDING -> {
                order.markPaid(paymentIntentId);
                log.info("결제 완료 — orderId={}, paymentIntentId={}", orderId, paymentIntentId);
            }
            case PAID -> log.info("이미 결제 완료된 주문 — 무시. orderId={}", orderId);
            case CANCELLED -> {
                // 취소 후 결제가 도착한 경우 — 재고는 이미 복구되어 이행할 수 없다.
                log.error("취소된 주문에 결제 성공 도착 — 자동 환불 시도. orderId={}, paymentIntentId={}",
                        orderId, paymentIntentId);
                refund(paymentIntentId);
            }
            default -> log.warn("결제 성공 Webhook — 전이 대상이 아닌 상태. orderId={}, status={}",
                    orderId, order.getStatus());
        }
    }

    /**
     * 결제 실패 처리 — 주문을 취소하고 차감했던 재고를 되돌린다.
     *
     * 재고 복구를 빠뜨리면 만료 정리 스케줄러는 PENDING만 대상으로 하므로
     * 이 주문의 재고는 영구히 회수되지 않는다.
     */
    private void handlePaymentFailed(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId).orElse(null);
        if (order == null) {
            log.warn("Webhook — 주문을 찾을 수 없음: orderId={}", orderId);
            return;
        }

        // PENDING이 아니면 이미 다른 경로에서 재고가 복구되었으므로 중복 복구를 막는다.
        if (order.getStatus() != OrderStatus.PENDING) {
            log.info("결제 실패 Webhook — PENDING이 아니므로 무시. orderId={}, status={}",
                    orderId, order.getStatus());
            return;
        }

        order.updateStatus(OrderStatus.CANCELLED);
        order.restoreStock();
        log.warn("결제 실패로 주문 취소 및 재고 복구 — orderId={}", orderId);
    }

    private void saveProcessedEvent(Event event) {
        processedEventRepository.save(new ProcessedStripeEvent(event.getId(), event.getType()));
    }

    /**
     * raw JSON payload에서 data.object를 꺼낸다.
     * Stripe SDK의 getDataObjectDeserializer()는 API 버전이 SDK와 다를 때 비어있을 수 있음
     */
    private JsonObject parseDataObject(String payloadStr) {
        try {
            return JsonParser.parseString(payloadStr)
                    .getAsJsonObject()
                    .getAsJsonObject("data")
                    .getAsJsonObject("object");
        } catch (Exception e) {
            log.error("Webhook JSON 파싱 실패: {}", e.getMessage());
            return null;
        }
    }

    /** data.object.metadata.orderId — PaymentIntent 생성 시 넣어둔 값 */
    private String extractOrderId(JsonObject dataObject) {
        if (dataObject == null) return null;
        JsonObject metadata = dataObject.getAsJsonObject("metadata");
        if (metadata == null || !metadata.has("orderId")) return null;
        return metadata.get("orderId").getAsString();
    }

    /** data.object.id — payment_intent.* 이벤트에서는 PaymentIntent id(pi_...) */
    private String extractPaymentIntentId(JsonObject dataObject) {
        if (dataObject == null || !dataObject.has("id")) return null;
        return dataObject.get("id").getAsString();
    }
}
