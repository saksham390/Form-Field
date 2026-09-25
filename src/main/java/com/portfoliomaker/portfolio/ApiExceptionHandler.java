package com.portfoliomaker.portfolio;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleInvalidRequest(MethodArgumentNotValidException exception) {
		return ResponseEntity.badRequest().body(Map.of("message", "Add a portfolio brief of up to 6,000 characters."));
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<Map<String, String>> handleStatusException(ResponseStatusException exception) {
		return ResponseEntity.status(exception.getStatusCode())
				.body(Map.of("message", exception.getReason() == null ? "Request could not be completed." : exception.getReason()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, String>> handleGenerationFailure(Exception exception) {
		return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
				.body(Map.of("message", "Gemini could not generate this portfolio. Check your API key and try again."));
	}
}