import { ToolCall, LLMResponse } from "@/types";

// Re-export shared types for convenience
export type { ToolCall, LLMResponse };

// ============================================================================
// LLM Model Types
// ============================================================================

export enum LLMModel {
	DEEPSEEK = "DEEPSEEK",
	MISTRAL_SMALL = "MISTRAL_SMALL",
	AMAZON_NOVA_LITE = "AMAZON_NOVA_LITE",
	MISTRAL_7B_INSTRUCT = "MISTRAL_7B_INSTRUCT",
	GEMINI_FLASH = "GEMINI_FLASH",
}

export const MODEL_IDENTIFIERS: Record<LLMModel, string> = {
	[LLMModel.DEEPSEEK]: "tngtech/deepseek-r1t2-chimera",
	[LLMModel.MISTRAL_SMALL]: "mistralai/mistral-small-3.1-24b-instruct",
	[LLMModel.AMAZON_NOVA_LITE]: "amazon/nova-2-lite-v1",
	[LLMModel.MISTRAL_7B_INSTRUCT]: "mistralai/mistral-7b-instruct",
	[LLMModel.GEMINI_FLASH]: "google/gemini-2.0-flash-001",
};

export function getModelIdentifier(model: LLMModel): string {
	return MODEL_IDENTIFIERS[model];
}

// ============================================================================
// Chat Message Types
// ============================================================================

export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string | null;
	reasoning_content?: string;
	tool_calls?: ToolCall[];
}

export interface ToolResultMessage {
	role: "tool";
	tool_call_id: string;
	content: string;
}

export type MessageInput = ChatMessage | ToolResultMessage;

// ============================================================================
// Function/Tool Definition Types
// ============================================================================

export interface FunctionDefinition {
	name: string;
	description: string;
	parameters: {
		type: "object";
		properties: Record<
			string,
			{
				type: string;
				description?: string;
				enum?: string[];
				items?: { type: string };
			}
		>;
		required?: string[];
	};
}

// ============================================================================
// Config Types
// ============================================================================

export interface LLMConfig {
	model?: LLMModel;
	temperature?: number;
	maxTokens?: number;
	systemPrompt?: string;
	reasoning?: boolean;
	tools?: FunctionDefinition[];
	toolChoice?:
		| "auto"
		| "none"
		| "required"
		| { type: "function"; function: { name: string } };
}
