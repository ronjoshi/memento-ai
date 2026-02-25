"use client";

import { useState, useCallback, ReactNode, createElement } from "react";
import { useAuth } from "@/contexts/AuthContext";

const TEST_EMAIL = "sample@mementoai.com";

export function useTestAccount() {
	const { user } = useAuth();
	const [toastVisible, setToastVisible] = useState(false);

	const isTestAccount = user?.email === TEST_EMAIL;

	const showToast = useCallback(() => {
		setToastVisible(true);
	}, []);

	const hideToast = useCallback(() => {
		setToastVisible(false);
	}, []);

	const toastMessage: ReactNode = createElement(
		"span",
		null,
		"Creating, editing, and deleting memories is disabled for the test account! Head to the ",
		createElement(
			"a",
			{
				href: "/app/chat",
				className: "font-semibold text-primary underline cursor-pointer",
			},
			"Chat"
		),
		" to try the AI."
	);

	return {
		isTestAccount,
		toastVisible,
		toastMessage,
		showToast,
		hideToast,
	};
}
