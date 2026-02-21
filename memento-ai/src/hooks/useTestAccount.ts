"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const TEST_EMAIL = "sample@mementoai.com";
const TEST_MESSAGE = "This is disabled for the test account!";

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

	return {
		isTestAccount,
		toastVisible,
		toastMessage: TEST_MESSAGE,
		showToast,
		hideToast,
	};
}
