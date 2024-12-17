import { useEffect, useRef } from 'react';
import { MobileUtils } from "./mobile.utils";

/**
 * A hook to handle custom back button behavior when in a WebView.
 * @param onBack - A callback function that returns `true` to prevent navigation or `false` to allow it.
 */
export const useWebviewBackHandler = (onBack: () => boolean): void => {
    const onBackRef = useRef(onBack);

    // Keep the latest onBack function in the ref
    useEffect(() => {
        onBackRef.current = onBack;
    }, [onBack]);

    useEffect(() => {
        if (!MobileUtils.webViewPresence()) return; // Allow normal routing if not in WebView

        const handleBackButton = () => {
            const shouldPreventNavigation = onBackRef.current();
            if (shouldPreventNavigation) {
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        // Add event listener for the back button
        window.addEventListener('popstate', handleBackButton);

        // Push the initial state to make the back button functional
        window.history.pushState(null, '', window.location.pathname);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, []);
};
