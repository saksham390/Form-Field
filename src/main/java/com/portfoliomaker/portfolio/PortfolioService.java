package com.portfoliomaker.portfolio;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class PortfolioService {

	private static final String SYSTEM_PROMPT = """
			You are an expert portfolio editor and personal-brand strategist.
			Turn the user's notes into a polished, credible portfolio draft.
			Return only the requested structured PortfolioDraft data.
			Never invent employers, dates, credentials, clients, metrics, contact details, or URLs.
			When a detail is missing, use a short editable placeholder such as 'Add your email' or omit the item.
			Keep the headline concise, introduction in first person, project descriptions specific but brief,
			and skills limited to those supported by the brief. Preserve the user's real names and facts.
			The requested visual style is guidance for voice and presentation, not a reason to change facts.
			""";

	private final ChatClient chatClient;

	public PortfolioService(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	public PortfolioDraft generate(GeneratePortfolioRequest request) {
		return chatClient.prompt()
				.system(SYSTEM_PROMPT)
				.user("Visual style: " + request.style() + "\n\nUser's portfolio notes:\n" + request.brief())
				.call()
				.entity(PortfolioDraft.class);
	}
}