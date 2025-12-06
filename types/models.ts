export enum LLMModel {
	DEEPSEEK = "DEEPSEEK",
	MISTRAL_SMALL = "MISTRAL_SMALL",
	AMAZON_NOVA_LITE = "AMAZON_NOVA_LITE",
	MISTRAL_7B_INSTRUCT = "MISTRAL_7B_INSTRUCT",
}

export const MODEL_IDENTIFIERS: Record<LLMModel, string> = {
	[LLMModel.DEEPSEEK]: "tngtech/deepseek-r1t2-chimera:free",
	[LLMModel.MISTRAL_SMALL]: "mistralai/mistral-small-3.1-24b-instruct:free",
	[LLMModel.AMAZON_NOVA_LITE]: "amazon/nova-2-lite-v1:free",
	[LLMModel.MISTRAL_7B_INSTRUCT]: "mistralai/mistral-7b-instruct:free",
};

export function getModelIdentifier(model: LLMModel): string {
	return MODEL_IDENTIFIERS[model];
}
