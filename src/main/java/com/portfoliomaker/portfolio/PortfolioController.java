package com.portfoliomaker.portfolio;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PortfolioController {

	private final PortfolioService portfolioService;
	private final boolean geminiConfigured;

	public PortfolioController(
			PortfolioService portfolioService,
			@Value("${spring.ai.google.genai.api-key:}") String geminiApiKey) {
		this.portfolioService = portfolioService;
		this.geminiConfigured = !geminiApiKey.isBlank() && !"not-configured".equals(geminiApiKey);
	}

	@GetMapping("/status")
	public Map<String, Boolean> status() {
		return Map.of("geminiConfigured", geminiConfigured);
	}

	@PostMapping("/portfolio/generate")
	@ResponseStatus(HttpStatus.OK)
	public PortfolioDraft generate(@Valid @RequestBody GeneratePortfolioRequest request) {
		if (!geminiConfigured) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
					"Add GEMINI_API_KEY to your environment and restart the app.");
		}
		return portfolioService.generate(request);
	}
}