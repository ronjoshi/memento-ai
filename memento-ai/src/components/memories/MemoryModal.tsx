"use client";

import { useState, useEffect } from "react";
import { Memory, Tag, TagColor } from "@/types";
import TagSelector from "@/components/tags/TagSelector";

interface MemoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (memoryData: string, tagIds: number[], createdAt?: string) => Promise<void>;
	availableTags: Tag[];
	onCreateTag: (name: string, color: TagColor) => Promise<Tag>;
	onDeleteTag?: (tagId: number) => Promise<void>;
	editingMemory?: Memory | null;
}

export default function MemoryModal({
	isOpen,
	onClose,
	onSave,
	availableTags,
	onCreateTag,
	onDeleteTag,
	editingMemory,
}: MemoryModalProps) {
	const [memoryText, setMemoryText] = useState("");
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const isEditing = !!editingMemory;

	// Reset form when modal opens or editingMemory changes
	useEffect(() => {
		if (isOpen) {
			if (editingMemory) {
				setMemoryText(editingMemory.memoryData);
				setSelectedTagIds(editingMemory.tagIds || []);
				// Convert ISO string to local datetime-local format
				const date = new Date(editingMemory.createdAt);
				const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
				setSelectedDate(localDate.toISOString().slice(0, 16));
			} else {
				setMemoryText("");
				setSelectedTagIds([]);
				// Default to current date/time
				const now = new Date();
				const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
				setSelectedDate(localNow.toISOString().slice(0, 16));
			}
			setError("");
		}
	}, [isOpen, editingMemory]);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!memoryText.trim()) {
			setError("Please enter memory content");
			return;
		}

		if (selectedTagIds.length === 0) {
			setError("Please select at least one tag");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// Convert local datetime to ISO string
			const createdAt = selectedDate ? new Date(selectedDate).toISOString() : undefined;
			await onSave(memoryText.trim(), selectedTagIds, createdAt);
			setMemoryText("");
			setSelectedTagIds([]);
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save memory",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setMemoryText("");
			setSelectedTagIds([]);
			setError("");
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/80 backdrop-blur-sm"
				onClick={handleClose}
			/>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative w-full max-w-lg transform rounded-2xl bg-card shadow-xl border border-card-border">
					{/* Header */}
					<div className="border-b border-border px-6 py-4">
						<h3 className="text-lg font-semibold text-card-foreground">
							{isEditing ? "Edit Memory" : "Add Memory"}
						</h3>
					</div>

					{/* Content */}
					<div className="px-6 py-4 space-y-4">
						<div>
							<label
								htmlFor="memory-content"
								className="block text-sm font-medium text-card-foreground mb-2"
							>
								Memory
							</label>
							<textarea
								id="memory-content"
								rows={10}
								value={memoryText}
								onChange={(e) => setMemoryText(e.target.value)}
								placeholder="What do you want to remember?"
								className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground resize-y min-h-[200px]"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="memory-date"
								className="block text-sm font-medium text-card-foreground mb-2"
							>
								Date
							</label>
							<input
								id="memory-date"
								type="datetime-local"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="memory-tags"
								className="block text-sm font-medium text-card-foreground mb-2"
							>
								Tags
							</label>
							<TagSelector
								availableTags={availableTags}
								selectedTagIds={selectedTagIds}
								onTagsChange={setSelectedTagIds}
								onCreateTag={onCreateTag}
								onDeleteTag={onDeleteTag}
								disabled={isLoading}
							/>
						</div>

						{error && (
							<div className="rounded-xl bg-error-light p-3 border border-error/20">
								<p className="text-sm text-error">{error}</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="border-t border-border px-6 py-4 flex justify-end space-x-3">
						<button
							type="button"
							onClick={handleClose}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-secondary/10 rounded-xl disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50 flex items-center shadow-sm"
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
									Saving...
								</>
							) : isEditing ? (
								"Save Changes"
							) : (
								"Save Memory"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
