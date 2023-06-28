import { expectText } from "../../utils/assertions"
import { groupAdminFixture as test } from "../../fixtures"
import { expect } from "@playwright/test"

test.describe("ATS Integration", () => {
   test("Can successfully link account & test application", async ({
      groupPage,
   }) => {
      const atsPage = await groupPage.goToATSPage()

      /**
       * Be sure to setup all the route interceptors at the start of
       */
      await Promise.all([
         atsPage.mockATSInitiationRequest(),
         atsPage.mockLinkedAccountRequest(),
         atsPage.mockFetchATSSyncStatusRequest(),
      ])

      await atsPage.linkAccount()

      /**
       * Merge Pop-up dialog flow
       */
      await atsPage.selectATS()
      await atsPage.enterAPIKey(variables.apiKey)
      await atsPage.submitAPIKey()
      await atsPage.finishAndCloseMergeDialog()

      await expect(atsPage.syncStatusHeader).toBeVisible()

      // Sync status header should disappear after syncing is complete
      await expect(atsPage.syncStatusHeader).not.toBeVisible({
         timeout: 7000,
      })

      await atsPage.checkJobsExistInTable(variables.jobs)

      await atsPage.startApplicationTest()
      await atsPage.selectJobForApplicationTest(variables.jobs[0].name)
      await atsPage.completeApplicationTest()

      await expectText(
         atsPage.page,
         "Application was successful! You can now associate jobs to livestreams and start"
      )
   })
})

const variables = {
   apiKey: "088ec780160bea9d7d3b23dca4966889-3",
   jobs: [
      { name: "Job 1", description: "Job description 1" },
      { name: "Job 2", description: "Job description 2" },
      { name: "Job 3", description: "Job description 3" },
      { name: "Job 4", description: "Job description 4" },
      { name: "Job 5", description: "Job description 5" },
   ],
}
