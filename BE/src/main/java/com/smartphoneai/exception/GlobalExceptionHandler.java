package com.smartphoneai.exception;

import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.time.Instant;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingRequestHeaderException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(KnowledgeNotFoundException.class)
    public ResponseEntity<ApiError> knowledgeNotFound(KnowledgeNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("KNOWLEDGE_NOT_FOUND", "Không tìm thấy tài liệu", Instant.now()));
    }
    @ExceptionHandler(InvalidKnowledgeFileException.class)
    public ResponseEntity<ApiError> invalidKnowledgeFile(InvalidKnowledgeFileException exception) {
        return ResponseEntity.badRequest().body(new ApiError("INVALID_KNOWLEDGE_FILE", "Tài liệu không hợp lệ hoặc không có văn bản trích xuất được", Instant.now()));
    }
    @ExceptionHandler(ChatUnauthorizedException.class)
    public ResponseEntity<ApiError> chatUnauthorized(ChatUnauthorizedException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("UNAUTHORIZED", "Phiên chat không hợp lệ", Instant.now()));
    }
    @ExceptionHandler(GuestMessageLimitException.class)
    public ResponseEntity<ApiError> guestMessageLimit(GuestMessageLimitException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiError("GUEST_MESSAGE_LIMIT", "Vui lòng đăng nhập để tiếp tục chat", Instant.now()));
    }
    @ExceptionHandler(InvalidTopicSwitchException.class)
    public ResponseEntity<ApiError> invalidTopicSwitch(InvalidTopicSwitchException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("INVALID_TOPIC_SWITCH", "Yêu cầu chuyển chủ đề không hợp lệ", Instant.now()));
    }
    @ExceptionHandler(ConversationNotFoundException.class)
    public ResponseEntity<ApiError> conversationNotFound(ConversationNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("CONVERSATION_NOT_FOUND", "Không tìm thấy hội thoại", Instant.now()));
    }
    @ExceptionHandler(InvalidAiConfigurationException.class)
    public ResponseEntity<ApiError> invalidAiConfiguration(InvalidAiConfigurationException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("INVALID_AI_CONFIGURATION", "Cấu hình AI chưa hợp lệ hoặc chưa kiểm tra", Instant.now()));
    }
    @ExceptionHandler(AiProviderException.class)
    public ResponseEntity<ApiError> aiProviderError(AiProviderException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ApiError("AI_PROVIDER_ERROR", "Không thể kết nối nhà cung cấp AI", Instant.now()));
    }
    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class, MissingRequestHeaderException.class})
    public ResponseEntity<ApiError> invalidRequest(Exception exception) {
        return ResponseEntity.badRequest().body(new ApiError("VALIDATION_ERROR", "Dữ liệu yêu cầu không hợp lệ", Instant.now()));
    }
    @ExceptionHandler(CatalogConflictException.class)
    public ResponseEntity<ApiError> catalogConflict(CatalogConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("CATALOG_CONFLICT", "Không thể cập nhật danh mục", Instant.now()));
    }
    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ApiError> orderNotFound(OrderNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng", Instant.now()));
    }
    @ExceptionHandler(OrderConflictException.class)
    public ResponseEntity<ApiError> orderConflict(OrderConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError(exception.getCode(), "Không thể xác nhận đơn hàng; vui lòng kiểm tra lại", Instant.now()));
    }
    @ExceptionHandler(CartActionException.class)
    public ResponseEntity<ApiError> cartAction(CartActionException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("INVALID_CART_ITEM", "Không thể cập nhật sản phẩm trong giỏ", Instant.now()));
    }
    @ExceptionHandler(ProtectedAccountException.class)
    public ResponseEntity<ApiError> protectedAccount(ProtectedAccountException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiError("FORBIDDEN", "Không thể thay đổi tài khoản này", Instant.now()));
    }
    @ExceptionHandler(InvalidInvitationException.class)
    public ResponseEntity<ApiError> invalidInvitation(InvalidInvitationException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("INVALID_INVITATION", "Lời mời không hợp lệ hoặc đã hết hạn", Instant.now()));
    }
    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ApiError> invalidPassword(InvalidPasswordException exception) {
        return ResponseEntity.badRequest().body(new ApiError("VALIDATION_ERROR", "Mật khẩu quá dài", Instant.now()));
    }
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> invalidCredentials(InvalidCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError("INVALID_CREDENTIALS", "Thông tin đăng nhập không hợp lệ", Instant.now()));
    }
    @ExceptionHandler(OtpRateLimitException.class)
    public ResponseEntity<ApiError> otpRateLimit(OtpRateLimitException exception) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ApiError("OTP_RATE_LIMIT", "Chưa thể gửi lại mã", Instant.now()));
    }
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> emailExists(EmailAlreadyExistsException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("EMAIL_EXISTS", "Email đã được sử dụng", Instant.now()));
    }
    @ExceptionHandler(InvalidPaginationException.class)
    public ResponseEntity<ApiError> invalidPagination(InvalidPaginationException exception) {
        return ResponseEntity.badRequest().body(new ApiError("VALIDATION_ERROR", "Phân trang không hợp lệ", Instant.now()));
    }
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiError> productNotFound(ProductNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError("PRODUCT_NOT_FOUND", "Không tìm thấy sản phẩm", Instant.now()));
    }
}
