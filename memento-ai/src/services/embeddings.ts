// Embeddings service - ports embedding generation from ContentView.swift
// Generates vector embeddings using OpenRouter API

interface EmbeddingResponse {
	data: Array<{
		embedding: number[];
	}>;
}

export async function generateEmbedding(text: string): Promise<number[]> {
	const apiKey = process.env.OPENROUTER_EMBEDDINGS_KEY;

	if (!apiKey) {
		throw new Error(
			"OPENROUTER_EMBEDDINGS_KEY not found in environment variables"
		);
	}

	const url = "https://openrouter.ai/api/v1/embeddings";

	const requestBody = {
		model: "openai/text-embedding-3-small",
		input: text,
		encoding_format: "float",
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
			`Invalid response from embeddings API: ${response.status} - ${errorText}`
		);
	}

	const json = (await response.json()) as EmbeddingResponse;

	if (!json.data || json.data.length === 0 || !json.data[0].embedding) {
		throw new Error("Failed to parse embedding response");
	}

	const embedding = json.data[0].embedding;

	console.log(`Generated embedding with ${embedding.length} dimensions`);

	return embedding;
}
