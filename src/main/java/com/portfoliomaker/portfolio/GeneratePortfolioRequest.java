package com.portfoliomaker.portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GeneratePortfolioRequest(
		@NotBlank @Size(max = 6000) String brief,
		@NotBlank @Size(max = 40) String style) {
}