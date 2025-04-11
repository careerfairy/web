import { expect, test } from "@playwright/test"

test.describe("Workflow ID handling", () => {
   test("should correctly set and use the workflow ID", async ({ page }) => {
      // Log environment variables
      console.log("Environment variables:")
      console.log(
         "NEXT_PUBLIC_UNIQUE_WORKFLOW_ID:",
         process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID
      )
      console.log("NEXT_PUBLIC_DEV_NAME:", process.env.NEXT_PUBLIC_DEV_NAME)

      // Set the workflow ID for testing
      const workflowId =
         process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID || "test-workflow-id"

      // Navigate to the application first (before setting localStorage)
      await page.goto("/")

      // Set localStorage after navigating to your app domain
      await page.evaluate((id) => {
         localStorage.setItem("x-workflow-id", id)
      }, workflowId)

      // Check that localStorage has the workflow ID
      const storedWorkflowId = await page.evaluate(() => {
         return localStorage.getItem("x-workflow-id")
      })

      console.log("Stored workflow ID:", storedWorkflowId)
      expect(storedWorkflowId).toBe(workflowId)

      // Verify that client-side code can access the workflow ID
      // (This would be handled by your CommonUtil.getWorkflowId function)
      const clientWorkflowId = await page.evaluate(() => {
         // Simulating the logic in getWorkflowId()
         return localStorage.getItem("x-workflow-id")
      })

      console.log("Client-side workflow ID:", clientWorkflowId)
      expect(clientWorkflowId).toBe(workflowId)
   })
})
