package com.nowon.shop.api.payment;

import com.nowon.shop.domain.payment.service.PaymentService;
import com.nowon.shop.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Tag(name = "Payments", description = "Stripe payment integration")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Create payment intent", description = "Creates a Stripe PaymentIntent for the given order and returns clientSecret.")
    @PostMapping("/intent/{orderId}")
    public ResponseEntity<ApiResponse<String>> createPaymentIntent(@PathVariable Long orderId) {
        String clientSecret = paymentService.createPaymentIntent(orderId);
        return ResponseEntity.ok(ApiResponse.data(clientSecret));
    }

    /**
     * Stripe Webhook — raw bytes로 읽어야 서명 검증이 정확함
     * @RequestBody String 사용 시 Spring이 UTF-8 변환 과정에서 바이트가 달라져 서명 불일치 발생
     */
    @Operation(summary = "Stripe webhook", description = "Receives Stripe events. Register this endpoint in Stripe Dashboard.")
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            HttpServletRequest request,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) throws IOException {
        byte[] payload = StreamUtils.copyToByteArray(request.getInputStream());
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
