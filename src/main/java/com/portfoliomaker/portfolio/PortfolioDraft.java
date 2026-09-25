package com.portfoliomaker.portfolio;

import java.util.List;

public record PortfolioDraft(
		String name,
		String role,
		String headline,
		String introduction,
		String location,
		String email,
		String availability,
		List<String> skills,
		List<Experience> experience,
		List<Project> projects,
		List<SocialLink> socials) {

	public record Experience(String role, String company, String period, String description) {
	}

	public record Project(String name, String category, String description, String link) {
	}

	public record SocialLink(String label, String url) {
	}
}