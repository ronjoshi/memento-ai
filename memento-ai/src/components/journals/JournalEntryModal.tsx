"use client";

import { useState, useEffect } from "react";
import { JournalEntry, Tag, TagColor } from "@/types";
import TagSelector from "@/components/tags/TagSelector";

interface JournalEntryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (journalData: string, tagIds: number[], createdAt?: string) => Promise<void>;
	availableTags: Tag[];
	onCreateTag: (name: string, color: TagColor) => Promise<Tag>;
	onDeleteTag?: (tagId: number) => Promise<void>;
	editingEntry?: JournalEntry | null;
}

export default function JournalEntryModal({
	isOpen,
	onClose,
	onSave,
	availableTags,
	onCreateTag,
	onDeleteTag,
	editingEntry,
}: JournalEntryModalProps) {
	const [entryText, setEntryText] = useState("");
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const isEditing = !!editingEntry;

	// Reset form when modal opens or editingEntry changes
	useEffect(() => {
		if (isOpen) {
			if (editingEntry) {
				setEntryText(editingEntry.journalData);
				setSelectedTagIds(editingEntry.tagIds || []);
				// Convert ISO string to local datetime-local format
				const date = new Date(editingEntry.createdAt);
				const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
				setSelectedDate(localDate.toISOString().slice(0, 16));
			} else {
				setEntryText("");
				setSelectedTagIds([]);
				// Default to current date/time
				const now = new Date();
				const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
				setSelectedDate(localNow.toISOString().slice(0, 16));
			}
			setError("");
		}
	}, [isOpen, editingEntry]);

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!entryText.trim()) {
			setError("Please enter journal entry content");
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
			await onSave(entryText.trim(), selectedTagIds, createdAt);
			setEntryText("");
			setSelectedTagIds([]);
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save journal entry",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setEntryText("");
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
							{isEditing ? "Edit Journal Entry" : "Add Journal Entry"}
						</h3>
					</div>

					{/* Content */}
					<div className="px-6 py-4 space-y-4">
						<div>
							<label
								htmlFor="entry-content"
								className="block text-sm font-medium text-card-foreground mb-2"
							>
								Journal Entry
							</label>
							<textarea
								id="entry-content"
								rows={10}
								value={entryText}
								onChange={(e) => setEntryText(e.target.value)}
								placeholder="What do you want to record?"
								className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground resize-y min-h-[200px]"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="entry-date"
								className="block text-sm font-medium text-card-foreground mb-2"
							>
								Date
							</label>
							<input
								id="entry-date"
								type="datetime-local"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="entry-tags"
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
								"Save Journal Entry"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
