package com.nowon.shop.global.exception;

import com.nowon.shop.global.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 커스텀 예외 처리
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("BusinessException: {}", e.getMessage());
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(ApiResponse.error(e.getMessage()));
    }

    // @Valid 검증 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse(ErrorCode.INVALID_INPUT.getMessage());
        log.warn("ValidationException: {}", message);
        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT.getHttpStatus())
                .body(ApiResponse.error(message));
    }

    // 잘못된 타입의 파라미터 (예: 존재하지 않는 OrderStatus enum 값) 처리
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        String message = String.format("잘못된 파라미터 값입니다: %s", e.getName());
        log.warn("TypeMismatchException: {} (value={})", e.getName(), e.getValue());
        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT.getHttpStatus())
                .body(ApiResponse.error(message));
    }

    // 필수 요청 파라미터 누락 처리
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException e) {
        String message = String.format("필수 파라미터가 누락되었습니다: %s", e.getParameterName());
        log.warn("MissingParameterException: {}", e.getParameterName());
        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT.getHttpStatus())
                .body(ApiResponse.error(message));
    }

    // 읽을 수 없는 요청 본문 (잘못된 JSON 등) 처리
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException e) {
        log.warn("HttpMessageNotReadableException: {}", e.getMessage());
        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.INVALID_INPUT.getMessage()));
    }

    // 그 외 예상치 못한 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected Exception: ", e);
        return ResponseEntity
                .status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}
