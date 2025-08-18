/**
 * Quick test script for Algolia events
 * Run this in your browser console to test event sending
 */

// Copy and paste this into your browser console when your app is running
;(async function testAlgoliaEvents() {
   console.log("🧪 Testing Algolia Events...")

   try {
      // Import the service (adjust path if needed)
      const { algoliaEventsService, generateUserToken } = await import(
         "/data/algolia/AlgoliaEventsService.js"
      )

      const testUserToken = generateUserToken("test_user_" + Date.now())

      console.log("User Token:", testUserToken)

      // Test 1: Search Result Click
      console.log("📤 Sending search result click event...")
      await algoliaEventsService.trackSearchResultClick({
         index: "livestreams",
         queryID: "test_query_" + Date.now(),
         objectID: "test_livestream_123",
         position: 0,
         userToken: testUserToken,
         eventName: "Test Search Result Click",
      })
      console.log("✅ Search result click sent")

      // Test 2: Conversion Event
      console.log("📤 Sending conversion event...")
      await algoliaEventsService.trackConversion({
         index: "livestreams",
         queryID: "test_query_" + Date.now(),
         objectIDs: ["test_livestream_123"],
         userToken: testUserToken,
         eventName: "Test Conversion",
         value: 5,
      })
      console.log("✅ Conversion event sent")

      console.log("🎉 All test events sent successfully!")
      console.log("👀 Check your Algolia Dashboard → Events in a few seconds")
   } catch (error) {
      console.error("❌ Error testing events:", error)
   }
})()
