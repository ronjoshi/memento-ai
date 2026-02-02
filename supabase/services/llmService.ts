/// <reference lib="deno.ns" />

import OpenAI from "openai";
import { LLMModel, getModelIdentifier } from "../../types/models.js";

// Load environment variables for Deno
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
const OPENROUTER_OPENAI_EMBEDDINGS_KEY =
	Deno.env.get("OPENROUTER_OPENAI_EMBEDDINGS_KEY") || "";

const chatClient = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: OPENROUTER_API_KEY,
	defaultHeaders: {},
});

const embeddingsClient = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: OPENROUTER_OPENAI_EMBEDDINGS_KEY,
	defaultHeaders: {},
});

export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface LLMConfig {
	model?: LLMModel;
	temperature?: number;
	maxTokens?: number;
}

export class LLMService {
	private defaultModel = LLMModel.MISTRAL_7B_INSTRUCT;

	async chatCompletion(
		messages: ChatMessage[],
		config: LLMConfig = {},
	): Promise<string> {
		try {
			const completion = await chatClient.chat.completions.create({
				model: getModelIdentifier(config.model || this.defaultModel),
				messages: messages,
				temperature: config.temperature,
				max_tokens: config.maxTokens,
			});

			return completion.choices[0]?.message?.content || "";
		} catch (error) {
			console.error("LLM API Error:", error);
			throw new Error(`Failed to get LLM response: ${error}`);
		}
	}

	simpleChat(prompt: string, config: LLMConfig = {}): Promise<string> {
		const messages: ChatMessage[] = [
			{
				role: "user",
				content: prompt,
			},
		];

		return this.chatCompletion(messages, config);
	}

	async getEmbedding() {
		const embedding = await embeddingsClient.embeddings.create({
			model: "openai/text-embedding-3-small",
			input: "what was my work ethic like last week?",
			encoding_format: "float",
		});

		console.log(embedding.data[0].embedding);
	}
}

export const llmService = new LLMService();
