"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTags } from "@/contexts/TagContext";
import { useTestAccount } from "@/hooks/useTestAccount";
import { JournalEntry, Tag, TagColor } from "@/types";
import JournalEntryList from "@/components/journals/JournalEntryList";
import JournalEntryModal from "@/components/journals/JournalEntryModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import TagFilter from "@/components/journals/TagFilter";

export default function JournalsPage() {
	const { signOut } = useAuth();
	const { availableTags, selectedTagIds, createTag, deleteTag } = useTags();
	const { isTestAccount, toastVisible, toastMessage, showToast, hideToast } = useTestAccount();
	const router = useRouter();
	const PAGE_SIZE = 50;
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
	const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadJournals = useCallback(async (offset = 0, append = false) => {
		try {
			if (append) {
				setIsLoadingMore(true);
			} else {
				setIsLoading(true);
			}

			let data: any;

			// Check if filtering by tags
			if (selectedTagIds.length > 0) {
				// Use /api/search/tag endpoint for filtering
				const response = await fetch("/api/search/tag", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tagIds: selectedTagIds,
						limit: PAGE_SIZE,
						offset: offset
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to fetch filtered journal entries");
				}

				data = await response.json();
				// Pagination is now supported when filtering
				if (append) {
					setEntries((prev) => [...prev, ...data.journals]);
				} else {
					setEntries(data.journals);
				}
				setHasMore(data.hasMore);
			} else {
				// Use regular endpoint with pagination
				const response = await fetch(
					`/api/memories?limit=${PAGE_SIZE}&offset=${offset}`
				);

				if (!response.ok) {
					throw new Error("Failed to fetch journal entries");
				}

				data = await response.json();
				if (append) {
					setEntries((prev) => [...prev, ...data.journals]);
				} else {
					setEntries(data.journals);
				}
				setHasMore(data.hasMore);
			}
		} catch (error) {
			console.error("Error loading journal entries:", error);
		} finally {
			setIsLoading(false);
			setIsLoadingMore(false);
		}
	}, [selectedTagIds]);

	const handleLoadMore = () => {
		loadJournals(entries.length, true);
	};

	useEffect(() => {
		loadJournals();
	}, [loadJournals]);

	const handleSaveJournal = async (journalData: string, tagIds: number[], createdAt?: string) => {
		if (editingEntry) {
			// Update existing journal entry
			const response = await fetch(`/api/memories/${editingEntry.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ journalData, tagIds, createdAt }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update journal entry");
			}
		} else {
			// Create new journal entry
			const response = await fetch("/api/memories", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ journalData, tagIds, createdAt }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save journal entry");
			}
		}

		await loadJournals();
	};

	const handleEditJournal = (entry: JournalEntry) => {
		if (isTestAccount) {
			showToast();
			return;
		}
		setEditingEntry(entry);
		setShowModal(true);
	};

	const handleDeleteJournal = (entry: JournalEntry) => {
		if (isTestAccount) {
			showToast();
			return;
		}
		setDeletingEntry(entry);
	};

	const confirmDeleteJournal = async () => {
		if (!deletingEntry) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/memories/${deletingEntry.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete journal entry");
			}

			await loadJournals();
			setDeletingEntry(null);
		} catch (error) {
			console.error("Error deleting journal entry:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingEntry(null);
	};

	const handleOpenAddModal = () => {
		if (isTestAccount) {
			showToast();
			return;
		}
		setEditingEntry(null);
		setShowModal(true);
	};

	const handleCreateTag = async (
		name: string,
		color: TagColor,
	): Promise<Tag> => {
		if (isTestAccount) {
			showToast();
			throw new Error("Disabled for test account");
		}
		return await createTag(name, color);
	};

	const handleDeleteTag = async (tagId: number): Promise<void> => {
		if (isTestAccount) {
			showToast();
			return;
		}
		await deleteTag(tagId);
	};

	const handleSignOut = async () => {
		await signOut();
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Toast notification */}
			<Toast
				message={toastMessage}
				isVisible={toastVisible}
				onClose={hideToast}
			/>

			{/* Header */}
			<header className="bg-card shadow-sm border-b border-card-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center">
						{/* Left: Logo (links home) */}
						<div className="flex-1">
							<button
								onClick={() => router.push("/")}
								className="flex items-center gap-2"
							>
								<Image
									src="/memento_logo.svg"
									alt="Memento"
									width={40}
									height={40}
									className="logo-cyan"
								/>
							</button>
						</div>

						{/* Center: Page title */}
						<h1 className="text-xl font-bold text-primary">
							Journals
						</h1>

						{/* Right: Action buttons */}
						<div className="flex-1 flex items-center justify-end space-x-3">
							<button
								onClick={() => router.push("/app/chat")}
								className="flex flex-col items-center gap-0.5 p-2 hover:opacity-80 transition-opacity"
								title="Chat"
							>
								<Image
									src="/chatbot.svg"
									alt="Chat"
									width={20}
									height={20}
								/>
								<span className="text-[9px] text-muted-foreground leading-none">Chat</span>
							</button>

							<button
								onClick={handleSignOut}
								className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-foreground transition-colors"
								title="Sign Out"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
								<span className="text-[9px] leading-none">Log out</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Demo Account Banner */}
			{isTestAccount && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
					<div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-center">
						<p className="text-sm text-muted-foreground">
							<span className="font-medium text-foreground">Demo account</span> — editing memories is disabled.{" "}
							Head to the{" "}
							<button
								onClick={() => router.push("/app/chat")}
								className="font-semibold text-primary underline decoration-primary/50 hover:decoration-primary cursor-pointer"
							>
								Chat
							</button>
							{" "}to try the AI, or check out the{" "}
							<button
								onClick={() => router.push("/demo-guide")}
								className="font-semibold text-primary underline decoration-primary/50 hover:decoration-primary cursor-pointer"
							>
								demo guide
							</button>
							{" "}for example prompts.
						</p>
					</div>
				</div>
			)}

			{/* New Journal Button */}
			<div className="flex justify-center py-6">
				<button
					onClick={handleOpenAddModal}
					className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary border border-primary hover:bg-primary/10 rounded-xl transition-colors"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Journal Entry
				</button>
			</div>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
				<TagFilter />
				<JournalEntryList
					entries={entries}
					isLoading={isLoading}
					isLoadingMore={isLoadingMore}
					hasMore={hasMore}
					onLoadMore={handleLoadMore}
					onEdit={handleEditJournal}
					onDelete={handleDeleteJournal}
				/>
			</main>

			{/* Journal Entry Modal */}
			<JournalEntryModal
				isOpen={showModal}
				onClose={handleCloseModal}
				onSave={handleSaveJournal}
				availableTags={availableTags}
				onCreateTag={handleCreateTag}
				onDeleteTag={handleDeleteTag}
				editingEntry={editingEntry}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={!!deletingEntry}
				title="Delete Journal Entry"
				message="Are you sure you want to delete this journal entry? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={confirmDeleteJournal}
				onCancel={() => setDeletingEntry(null)}
				isLoading={isDeleting}
			/>
		</div>
	);
}
