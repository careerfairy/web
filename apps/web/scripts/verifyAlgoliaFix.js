/**
 * Script to verify the Algolia Events Service initialization fix
 * Run this in the browser console to test the fix
 */

// Test the initialization fix
async function verifyAlgoliaFix() {
   console.log("🔧 Testing Algolia Events Service initialization fix...")

   try {
      // Import the service
      const { algoliaEventsService, generateUserToken } = await import(
         "../data/algolia/AlgoliaEventsService.ts"
      )

      console.log("✅ AlgoliaEventsService imported successfully")

      // Generate a test user token
      const userToken = generateUserToken("test_user_fix_verification")
      console.log("✅ User token generated:", userToken)

      // Try to send a test event immediately after service creation
      console.log("🧪 Attempting to send test event...")

      await algoliaEventsService.trackSearchResultClick({
         index: "test_index",
         queryID: "test_query_fix",
         objectID: "test_object_fix",
         position: 0,
         userToken: userToken,
         eventName: "Fix Verification Test Event",
      })

      console.log("✅ Test event sent successfully! The fix is working.")
      console.log(
         "📊 Check your browser network tab for requests to insights.algolia.io"
      )
   } catch (error) {
      console.error("❌ Fix verification failed:", error)
      console.error("Stack trace:", error.stack)
   }
}

// Make the function available globally for testing
if (typeof window !== "undefined") {
   window.verifyAlgoliaFix = verifyAlgoliaFix
   console.log("🚀 Run verifyAlgoliaFix() in the console to test the fix")
}

// Auto-run if in Node.js environment
if (typeof module !== "undefined" && module.exports) {
   verifyAlgoliaFix()
}
