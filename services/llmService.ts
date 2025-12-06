/// <reference lib="deno.ns" />

import OpenAI from 'openai';
import { LLMModel, getModelIdentifier } from '../types/models.ts';

// Load environment variables for Deno
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';

const openai = new OpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: OPENROUTER_API_KEY,
	defaultHeaders: {},
});

export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface LLMConfig {
	model?: LLMModel;
	temperature?: number;
	maxTokens?: number;
}

export class LLMService {
	private defaultModel = LLMModel.DEEPSEEK;

	async chatCompletion(messages: ChatMessage[], config: LLMConfig = {}): Promise<string> {
		try {
			const completion = await openai.chat.completions.create({
				model: getModelIdentifier(config.model || this.defaultModel),
				messages: messages,
				temperature: config.temperature,
				max_tokens: config.maxTokens,
			});

			return completion.choices[0]?.message?.content || '';
		} catch (error) {
			console.error('LLM API Error:', error);
			throw new Error(`Failed to get LLM response: ${error}`);
		}
	}

	simpleChat(prompt: string, config: LLMConfig = {}): Promise<string> {
		const messages: ChatMessage[] = [
			{
				role: 'user',
				content: prompt,
			},
		];

		return this.chatCompletion(messages, config);
	}
}

export const llmService = new LLMService();
