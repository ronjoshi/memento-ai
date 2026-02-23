"use client";

import { useMemo } from "react";
import { SAMPLE_PROMPTS } from "@/data/samplePrompts";

interface SamplePromptsProps {
	onSelectPrompt: (fullPrompt: string) => void;
}

export default function SamplePrompts({ onSelectPrompt }: SamplePromptsProps) {
	const selectedPrompts = useMemo(() => {
		const shuffled = [...SAMPLE_PROMPTS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 5);
	}, []);

	return (
		<div className="mt-6 max-w-lg mx-auto px-6">
			<p className="text-sm text-muted-foreground/80 mb-3">
				Welcome to the sample account! Try any of these to see how Memento works with your journals.
			</p>
			<div className="flex flex-wrap justify-center gap-2">
			{selectedPrompts.map((prompt, index) => (
				<button
					key={index}
					onClick={() => onSelectPrompt(prompt.fullPrompt)}
					className="px-3 py-1.5 text-sm rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
				>
					{prompt.label}
				</button>
			))}
			</div>
		</div>
	);
}
