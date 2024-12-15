import { useEffect } from 'react';

/**
 * A hook to handle custom back button behavior.
 * @param onBack - A callback function that returns `true` to prevent navigation or `false` to allow it.
 */
const useCustomBackHandler = (onBack: () => boolean): void => {
    useEffect(() => {
        const handleBackButton = () => {
            if (onBack && typeof onBack === 'function') {
                const shouldPreventNavigation = onBack();
                if (shouldPreventNavigation) {
                    // Push the same state to prevent navigation
                    window.history.pushState(null, '', window.location.pathname);
                }
            }
        };

        // Add event listener for the back button
        window.addEventListener('popstate', handleBackButton);

        // Push the initial state to make the back button functional
        window.history.pushState(null, '', window.location.pathname);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [onBack]);
};

export default useCustomBackHandler;
