import { useEffect, useRef } from 'react';
import { MobileUtils } from "./mobile.utils";
import { useRouter } from 'next/router';

/**
 * A hook to handle custom back button behavior when in a WebView.
 * @param onBack - A callback function that returns `true` to prevent navigation or `false` to allow it.
 */
export const useWebviewBackHandler = (onBack: () => boolean): void => {
    const onBackRef = useRef(onBack);
    const router = useRouter();

    // Keep the latest onBack function in the ref
    useEffect(() => {
        onBackRef.current = onBack;
    }, [onBack]);

    useEffect(() => {
        if (!MobileUtils.webViewPresence()) return; // Exit if not in a WebView context

        const handleRouteChangeStart = (url: string, options: any) => {
            // If options are undefined or null, default to an empty object
            if (!options) {
                options = {};
            }

            const shouldPreventNavigation = onBackRef.current();

            if (shouldPreventNavigation) {
                // Prevent navigation by replacing the current state
                window.history.pushState(null, '', window.location.href);

                // Close modal (or perform whatever actions you need)
                router.replace(router.asPath, undefined, { shallow: true });

                // Throw an error to cancel the navigation (this is required by Next.js)
                throw new Error('Navigation prevented by native webview experience');
            }
        };

        // Attach the handler for route changes
        router.events.on('routeChangeStart', handleRouteChangeStart);

        // Cleanup on unmount
        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
        };
    }, [router]);
};
