import { useRouter } from "next/router"
import Script from "next/script"
import React from "react"
import { shouldUseEmulators } from "util/CommonUtil"
import {
   getWindow,
   isEmbedded,
   isGroupAdminPath,
   isStreamingPath,
} from "util/PathUtils"

/**
 * Load Usercentrics scripts & Google Tag Manager when
 * rendering on the client side
 */
export const Usercentrics = () => {
   const {
      query: { useUsercentricsDraftVersion, isRecordingWindow },
      pathname,
   } = useRouter()

   /**
    * Don't run when developing / tests
    */
   if (shouldUseEmulators()) {
      return null
   }

   /**
    * Don't run usercentrics on recording sessions & embedded pages
    */
   if (isRecordingWindow || isEmbedded(pathname)) {
      console.log("Usercentrics disabled")
      return null
   }

   /**
    * We don't want to run GTM for group admin journeys or livestreams
    */
   const isGTMDisabled = isGroupAdminPath(pathname) || isStreamingPath(pathname)

   return (
      <>
         {/* Script will be injected in the <head> tag  */}
         <Script
            id="usercentrics-cmp"
            src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
            data-settings-id="T4NAUxIvE2tGD2"
            strategy="beforeInteractive"
            // by default uses the live version
            data-version={useUsercentricsDraftVersion ? "preview" : undefined}
         ></Script>

         {isGTMDisabled === false && (
            <Script
               id="google-analytics"
               strategy="beforeInteractive"
               // we need to load a script for GTM to be correctly enabled by usercentrics
               // inline script would prevent gtm from running after clicking accepting
               src="/scripts/gtm.js"
               type="text/plain"
               data-usercentrics="Google Tag Manager"
            ></Script>
         )}
      </>
   )
}
