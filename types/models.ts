export enum LLMModel {
	DEEPSEEK = 'DEEPSEEK',
}

export const MODEL_IDENTIFIERS: Record<LLMModel, string> = {
	[LLMModel.DEEPSEEK]: 'deepseek/deepseek-chat-v3.1:free',
};

export function getModelIdentifier(model: LLMModel): string {
	return MODEL_IDENTIFIERS[model];
}
