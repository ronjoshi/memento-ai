"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTestAccount } from "@/hooks/useTestAccount";
import { JournalEntry, Tag, TagColor } from "@/types";
import JournalEntryList from "@/components/journals/JournalEntryList";
import JournalEntryModal from "@/components/journals/JournalEntryModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";

export default function JournalsPage() {
	const { signOut } = useAuth();
	const { isTestAccount, toastVisible, toastMessage, showToast, hideToast } = useTestAccount();
	const router = useRouter();
	const PAGE_SIZE = 50;
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
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

			const response = await fetch(
				`/api/memories?limit=${PAGE_SIZE}&offset=${offset}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch journal entries");
			}

			const data = await response.json();

			if (append) {
				setEntries((prev) => [...prev, ...data.journals]);
			} else {
				setEntries(data.journals);
			}
			setHasMore(data.hasMore);
		} catch (error) {
			console.error("Error loading journal entries:", error);
		} finally {
			setIsLoading(false);
			setIsLoadingMore(false);
		}
	}, []);

	const handleLoadMore = () => {
		loadJournals(entries.length, true);
	};

	const loadTags = useCallback(async () => {
		try {
			const response = await fetch("/api/tags");

			if (!response.ok) {
				throw new Error("Failed to fetch tags");
			}

			const data = await response.json();
			setTags(data.tags);
		} catch (error) {
			console.error("Error loading tags:", error);
		}
	}, []);

	useEffect(() => {
		loadJournals();
		loadTags();
	}, [loadJournals, loadTags]);

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
		const response = await fetch("/api/tags", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, color }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to create tag");
		}

		const data = await response.json();
		setTags((prev) => [...prev, data.tag]);
		return data.tag;
	};

	const handleDeleteTag = async (tagId: number): Promise<void> => {
		if (isTestAccount) {
			showToast();
			return;
		}
		const response = await fetch(`/api/tags/${tagId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to delete tag");
		}

		setTags((prev) => prev.filter((tag) => tag.id !== tagId));
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
				availableTags={tags}
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
