package com.nowon.shop.api.payment;

import com.nowon.shop.domain.payment.service.PaymentService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payments", description = "Stripe payment integration")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * PaymentIntent 생성 — 프론트가 Stripe Elements를 초기화할 때 호출
     * 반환된 clientSecret으로 결제창을 띄움
     */
    @Operation(summary = "Create payment intent", description = "Creates a Stripe PaymentIntent for the given order and returns clientSecret.")
    @PostMapping("/intent/{orderId}")
    public ResponseEntity<ApiResponse<String>> createPaymentIntent(@PathVariable Long orderId) {
        String clientSecret = paymentService.createPaymentIntent(orderId);
        return ResponseEntity.ok(ApiResponse.ok(clientSecret));
    }

    /**
     * Stripe Webhook — 결제 완료 이벤트 수신
     * Stripe 대시보드에서 엔드포인트 등록 필요: POST /api/payments/webhook
     * 주의: Webhook body는 raw bytes여야 하므로 Spring의 HttpMessageConverter를 거치지 않아야 함
     */
    @Operation(summary = "Stripe webhook", description = "Receives Stripe events. Register this endpoint in Stripe Dashboard.")
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
