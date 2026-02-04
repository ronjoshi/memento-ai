export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export enum LLMModel {
	DEEPSEEK = "DEEPSEEK",
	MISTRAL_SMALL = "MISTRAL_SMALL",
	AMAZON_NOVA_LITE = "AMAZON_NOVA_LITE",
	MISTRAL_7B_INSTRUCT = "MISTRAL_7B_INSTRUCT",
}

export const MODEL_IDENTIFIERS: Record<LLMModel, string> = {
	[LLMModel.DEEPSEEK]: "tngtech/deepseek-r1t2-chimera",
	[LLMModel.MISTRAL_SMALL]: "mistralai/mistral-small-3.1-24b-instruct",
	[LLMModel.AMAZON_NOVA_LITE]: "amazon/nova-2-lite-v1",
	[LLMModel.MISTRAL_7B_INSTRUCT]: "mistralai/mistral-7b-instruct",
};

export function getModelIdentifier(model: LLMModel): string {
	return MODEL_IDENTIFIERS[model];
}

export interface LLMConfig {
	model?: LLMModel;
	temperature?: number;
	maxTokens?: number;
	systemPrompt?: string;
}

interface OpenRouterResponse {
	choices: Array<{
		message: {
			role: string;
			content: string;
		};
	}>;
}

const DEFAULT_MODEL = LLMModel.MISTRAL_7B_INSTRUCT;
const DEFAULT_SYSTEM_PROMPT = `You are Memento, a helpful AI assistant that helps users manage and recall their memories. You are friendly, concise, and helpful. When users ask about their memories or past experiences, help them reflect and organize their thoughts.`;

export async function chatCompletion(
	messages: ChatMessage[],
	config: LLMConfig = {},
): Promise<string> {
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error(
			"OPENROUTER_API_KEY not found in environment variables",
		);
	}

	const url = "https://openrouter.ai/api/v1/chat/completions";

	// Build messages array with system prompt
	const systemPrompt = config.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
	const messagesWithSystem: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		...messages,
	];

	const requestBody = {
		model: getModelIdentifier(config.model || DEFAULT_MODEL),
		messages: messagesWithSystem,
		temperature: config.temperature,
		max_tokens: config.maxTokens,
	};

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`OpenRouter API error: ${response.status} - ${errorText}`,
		);
	}

	const json = (await response.json()) as OpenRouterResponse;

	if (
		!json.choices ||
		json.choices.length === 0 ||
		!json.choices[0].message
	) {
		throw new Error("Invalid response from OpenRouter API");
	}

	return json.choices[0].message.content;
}
