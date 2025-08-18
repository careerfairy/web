/**
 * Utility functions for testing and debugging Algolia events
 * Use these in development to verify events are being sent correctly
 */

/**
 * Enable detailed logging for Algolia events in development
 * Add this to your app initialization in development mode
 */
export const enableAlgoliaEventsDebugging = () => {
   if (process.env.NODE_ENV !== "development") {
      console.warn(
         "Algolia events debugging should only be enabled in development"
      )
      return
   }

   // Intercept fetch requests to Algolia Insights API
   const originalFetch = window.fetch
   window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
      // Check if this is an Algolia Insights request
      if (typeof url === "string" && url.includes("insights.algolia.io")) {
         console.group("🔍 Algolia Event Sent")
         console.log("URL:", url)
         console.log("Method:", options?.method || "GET")

         if (options?.body) {
            try {
               const body = JSON.parse(options.body as string)
               console.log("Event Data:", body)

               // Highlight important fields
               if (body.events) {
                  body.events.forEach((event: any, index: number) => {
                     console.log(`Event ${index + 1}:`, {
                        eventType: event.eventType,
                        eventName: event.eventName,
                        index: event.index,
                        userToken: event.userToken,
                        queryID: event.queryID,
                        objectIDs: event.objectIDs,
                        positions: event.positions,
                     })
                  })
               }
            } catch (e) {
               console.log("Raw Body:", options.body)
            }
         }
         console.groupEnd()
      }

      return originalFetch(url, options)
   }

   console.log(
      "✅ Algolia events debugging enabled. Check console for event details."
   )
}

/**
 * Test function to manually trigger an event for testing
 * Call this from browser console to test event sending
 */
export const testAlgoliaEvent = async () => {
   const { algoliaEventsService, generateUserToken } = await import(
      "data/algolia/AlgoliaEventsService"
   )

   const testUserToken = generateUserToken("test_user_123")

   console.log("🧪 Sending test Algolia event...")

   try {
      await algoliaEventsService.trackSearchResultClick({
         index: "livestreams",
         queryID: "test_query_123",
         objectID: "test_object_123",
         position: 0,
         userToken: testUserToken,
         eventName: "Test Event from Console",
      })

      console.log("✅ Test event sent successfully!")
      console.log("Check Algolia Dashboard Events section in a few seconds")
   } catch (error) {
      console.error("❌ Failed to send test event:", error)
   }
}

// Make test function available globally in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
   ;(window as any).testAlgoliaEvent = testAlgoliaEvent
}
