package com.smartcampus.backend.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.smartcampus.backend.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> fields.put(error.getField(), error.getDefaultMessage()));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", "Validation failed");
        payload.put("errors", fields);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(payload));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(payload));
    }

    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleConflict(InvalidStatusTransitionException ex) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(payload));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleBadRequest(IllegalArgumentException ex) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(payload));
    }
}
