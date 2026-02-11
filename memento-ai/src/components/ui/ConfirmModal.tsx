"use client";

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export default function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = "Delete",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	isLoading = false,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onCancel}
			/>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative w-full max-w-sm transform rounded-2xl bg-card shadow-xl border border-card-border">
					{/* Content */}
					<div className="px-6 py-5">
						<h3 className="text-lg font-semibold text-card-foreground mb-2">
							{title}
						</h3>
						<p className="text-sm text-muted-foreground">
							{message}
						</p>
					</div>

					{/* Footer */}
					<div className="border-t border-border px-6 py-4 flex justify-end space-x-3">
						<button
							type="button"
							onClick={onCancel}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-secondary/10 rounded-xl disabled:opacity-50"
						>
							{cancelText}
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-error/80 rounded-xl disabled:opacity-50 flex items-center shadow-sm"
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
									Deleting...
								</>
							) : (
								confirmText
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
