// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
// import { llmService } from '../../../services/llmService.ts';

interface Memory {
	id: string;
	user_id: string;
	memory_data: string;
	tag: string;
	created_at: string;
}

interface Tag {
	id: number;
	user_id: string;
	name: string;
	created_at: string;
}

interface MemoryWithTag extends Memory {
	tags: Tag[];
}

Deno.serve(async (req) => {
	try {
		// Get authorization header
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Create Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
			global: {
				headers: { Authorization: authHeader },
			},
		});

		// Get authenticated user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			return new Response(JSON.stringify({ error: 'User not authenticated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { action } = await req.json();

		switch (action) {
			case 'summarizeMemories': {
				// Fetch all user memories
				const { data: memories, error } = await supabase
					.from('memories')
					.select('memory_data, tag, created_at')
					.eq('user_id', user.id);

				if (error) throw error;

				if (!memories || memories.length === 0) {
					return new Response(
						JSON.stringify({
							data: { summary: 'No memories found for this user.' },
						}),
						{
							headers: { 'Content-Type': 'application/json' },
						}
					);
				}

				// Format memories for LLM processing
				const memoryText = memories
					.map(
						(memory) =>
							`Memory (${memory.tag}): ${memory.memory_data} [Created: ${memory.created_at}]`
					)
					.join('\n\n');

				// Generate summary using LLM
				const prompt = `Please provide a comprehensive summary of the following user memories. Focus on key themes, patterns, and important information:

${memoryText}

Summary:`;

				try {
					// const summary = await llmService.simpleChat(prompt, {
					// 	temperature: 0.7,
					// 	maxTokens: 500,
					// });

					return new Response(JSON.stringify('TEMP RESPONSE LMAO'));

					// return new Response(
					// 	JSON.stringify({
					// 		data: {
					// 			summary,
					// 			totalMemories: memories.length,
					// 		},
					// 	}),
					// 	{
					// 		headers: { 'Content-Type': 'application/json' },
					// 	}
					// );
				} catch (llmError) {
					console.error('LLM Error:', llmError);
					return new Response(
						JSON.stringify({
							error: 'Failed to generate memory summary',
							details: llmError,
						}),
						{
							status: 500,
							headers: { 'Content-Type': 'application/json' },
						}
					);
				}
			}

			default:
				return new Response(JSON.stringify({ error: 'Invalid action' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
		}
	} catch (error) {
		console.error('Error:', error);
		return new Response(JSON.stringify({ error: error }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
});
