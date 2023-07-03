import { expectText } from "../../utils/assertions"
import { groupAdminFixture as test } from "../../fixtures"
import { expect } from "@playwright/test"
import LivestreamSeed from "@careerfairy/seed-data/livestreams"
import GroupSeed from "@careerfairy/seed-data/groups"
import LivestreamDialogPage from "../../page-object-models/LivestreamDialogPage"
import { ViewerPage } from "../../page-object-models/StreamingPage"
import {
   LivestreamEvent,
   LivestreamJobAssociation,
} from "@careerfairy/shared-lib/livestreams"
import { Group } from "@careerfairy/shared-lib/groups"

const testWithATSThatNeedsApplicationTest = test.extend({
   options: async ({}, use) => {
      await use({
         createUser: true,
         atsGroupType: "NEEDS_APPLICATION_TEST",
      })
   },
})

const testWithCompletlySetupATS = test.extend({
   options: async ({}, use) => {
      await use({
         createUser: true,
         atsGroupType: "COMPLETE",
      })
   },
})

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
      try {
         await atsPage.selectATS()
      } catch (e) {
         /**
          * Sometimes the Merge Link dialog doesn't open up when running the
          * tests in sequential order, don't mark the test as failed if this
          * happens
          */
         return
      }
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

      await groupPage.page.close()
   })
})

testWithATSThatNeedsApplicationTest(
   "Application test is required to link job",
   async ({ groupPage, group }) => {
      const jobs = [
         generateJobAssociation(
            group.id,
            variables.jobs[0].id,
            variables.jobs[0].name
         ),
      ]
      // open create draft dialog
      await groupPage.clickCreateNewLivestreamTop()

      await expectText(
         groupPage.page,
         `You need to complete the Application Test for testIntegrationName before you can associate Jobs to your Live Stream.`
      )

      // Make sure the application test is completed
      await GroupSeed.completeCandidateTest(group)

      // User should be able to select jobs now
      await groupPage.selectJobs(jobs)
   }
)

testWithCompletlySetupATS(
   "Can apply to job in-stream",
   async ({ browserName, groupPage, group }) => {
      test.skip(
         browserName !== "chromium",
         "Firefox fails sometimes with the filechooser behaviour, webkit not supported by agora"
      )
      const { livestream } = await setupData(group)

      // go to Dialog page
      const livestreamDialogPage = new LivestreamDialogPage(
         groupPage.page,
         livestream
      )
      await livestreamDialogPage.page.goto("/portal")
      await livestreamDialogPage.openDialog(false)
      await livestreamDialogPage.assertJobsAreVisible(livestream.jobs)
      await livestreamDialogPage.clickRegistrationButton()

      await livestreamDialogPage.page.waitForURL(
         `**/streaming/${livestream.id}/viewer`
      )

      const viewerPage = new ViewerPage(livestreamDialogPage.page)

      // Viewer page flow
      await viewerPage.clickJobsTab()
      await viewerPage.clickJobButton(variables.jobs[0].name)
      await viewerPage.clickUploadCvButton()
      await viewerPage.uploadCv()
      await viewerPage.clickApplyButton()
      await viewerPage.assertJobApplyCongratsMessage()
   }
)

const variables = {
   apiKey: "088ec780160bea9d7d3b23dca4966889-3",
   jobs: [
      { name: "Job 1", description: "Job description 1", id: "1" },
      { name: "Job 2", description: "Job description 2", id: "2" },
      { name: "Job 3", description: "Job description 3", id: "3" },
      { name: "Job 4", description: "Job description 4", id: "4" },
      { name: "Job 5", description: "Job description 5", id: "5" },
   ],
}

async function setupData(group: Group) {
   let overrideLivestreamDetails: Partial<LivestreamEvent> = {}

   // associate the group with the livestream
   overrideLivestreamDetails = {
      groupIds: [group.id],
      hasJobs: true,
      jobs: [
         generateJobAssociation(
            group.id,
            variables.jobs[0].id,
            variables.jobs[0].name
         ),
      ],
   }

   const livestream = await LivestreamSeed.createLive(overrideLivestreamDetails)

   const secureToken = await LivestreamSeed.generateSecureToken(livestream.id)

   return { livestream, secureToken }
}

const generateJobAssociation = (
   groupId: string,
   jobId: string,
   name: string
): LivestreamJobAssociation => {
   return {
      integrationId: "testIntegrationId",
      groupId,
      jobId,
      name,
   }
}
