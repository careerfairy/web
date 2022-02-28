import SessionStorageUtil from "./SessionStorageUtil";

/**
 * Patch console.error function to listen for Firestore connectivity issues
 */
if (typeof window !== "undefined") {
   const originalFn = console["error"];
   console["error"] = function (...args) {
      if (args.length === 2) {
         if (
            arguments[0].indexOf("@firebase/firestore") &&
            arguments[1].indexOf("Could not reach Cloud Firestore backend.")
         ) {
            try {
               if (!SessionStorageUtil.getIsLongPollingMode()) {
                  SessionStorageUtil.setIsLongPollingMode(true);
                  alert(
                     "Your network seems to be behind a proxy, we'll enable the site compatibility mode."
                  );
                  window.location.reload();
               }
            } catch (e) {
               console.error(e);
            }
         }
      }

      return originalFn.apply(console, args);
   };
}
