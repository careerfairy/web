import { expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"
import jsonResponse from "../../assets/mergeLinkInitiate.json"
import greenhouseResponse from "../../assets/greenhouseResponse.json"

test.describe("ATS Integration", () => {
   // Only run those tests on chromium

   test("Can successfully link account", async ({ groupPage }) => {
      const atsPage = await groupPage.goToATSPage()

      await atsPage.clickLinkAccountButton()

      // Mock the ATS response that the iframe will make
      await atsPage.page.route(
         "https://api.merge.dev/api/integrations/link/**",
         async (route) => {
            await route.fulfill({
               status: 200,
               body: JSON.stringify(jsonResponse),
            })
         }
      )

      // Mock the ATS response that the iframe will make

      await atsPage.page.route(
         "https://api.merge.dev/api/integrations/linked-account",
         async (route) => {
            await route.fulfill({
               status: 200,
               body: JSON.stringify(greenhouseResponse),
            })
         }
      )

      let syncStatusResponse = [
         // the initial state of your models based on the response data you provided
         {
            hydrated: true,
            id: "ats.Department",
            model: "Department",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122560,
            nextSync: 1687377977827,
         },
         {
            hydrated: true,
            id: "ats.RemoteUser",
            model: "RemoteUser",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122533,
            nextSync: 1687377374766,
         },
         {
            hydrated: true,
            id: "ats.Job",
            model: "Job",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122484,
            nextSync: 1687377977827,
         },
         {
            hydrated: true,
            id: "ats.Office",
            model: "Office",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122451,
            nextSync: 1687377977827,
         },
         {
            hydrated: true,
            id: "ats.JobInterviewStage",
            model: "JobInterviewStage",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122413,
            nextSync: 1687373998900,
         },
         {
            hydrated: true,
            id: "ats.Tag",
            model: "Tag",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122331,
            nextSync: 1687373960869,
         },
         {
            hydrated: true,
            id: "ats.Candidate",
            model: "Candidate",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122271,
            nextSync: 1687373960869,
         },
         {
            hydrated: true,
            id: "ats.EmailAddress",
            model: "EmailAddress",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122271,
            nextSync: 1687373960869,
         },
         {
            hydrated: true,
            id: "ats.PhoneNumber",
            model: "PhoneNumber",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122271,
            nextSync: 1687373960869,
         },
         {
            hydrated: true,
            id: "ats.Url",
            model: "Url",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122271,
            nextSync: 1687373960869,
         },
         {
            hydrated: true,
            id: "ats.Application",
            model: "Application",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122184,
            nextSync: 1687373998900,
         },
         {
            hydrated: true,
            id: "ats.Attachment",
            model: "Attachment",
            status: "SYNCING",
            isInitialSync: true,
            lastSync: 1687370122080,
            nextSync: 1687373899796,
         },
         {
            hydrated: true,
            id: "ats.Activity",
            model: "Activity",
            status: "DISABLED",
            isInitialSync: true,
            lastSync: null,
            nextSync: null,
         },
         {
            hydrated: true,
            id: "ats.EEOC",
            model: "EEOC",
            status: "DISABLED",
            isInitialSync: true,
            lastSync: null,
            nextSync: null,
         },
         {
            hydrated: true,
            id: "ats.Offer",
            model: "Offer",
            status: "DISABLED",
            isInitialSync: true,
            lastSync: null,
            nextSync: null,
         }, ////
         {
            hydrated: true,
            id: "ats.RejectReason",
            model: "RejectReason",
            status: "DISABLED",
            isInitialSync: true,
            lastSync: null,
            nextSync: null,
         },
         {
            hydrated: true,
            id: "ats.ScheduledInterview",
            model: "ScheduledInterview",
            status: "DISABLED",
            isInitialSync: true,
            lastSync: null,
            nextSync: null,
         },
         {
            hydrated: true,
            id: "ats.Scorecard",
            model: "Scorecard",
            status: "DISABLED",
            isInitialSync: true,
            lastSync: null,
            nextSync: null,
         },
      ]

      let nextModelToFinishIndex = 0

      await atsPage.page.route("**/fetchATSSyncStatus_eu", async (route) => {
         await route.fulfill({
            status: 200,
            body: JSON.stringify({ result: syncStatusResponse }),
         })

         // After each request, set the next model to "DONE" state.
         if (nextModelToFinishIndex < syncStatusResponse.length) {
            syncStatusResponse[nextModelToFinishIndex].status = "DONE"
            nextModelToFinishIndex++
         }
      })

      await atsPage.selectATS()
      await atsPage.enterAPIKey(credentials.apiKey)
      await atsPage.submitAPIKey()
      await atsPage.clickContinueButton() // First click
      await atsPage.clickContinueButton() // Second click
      await atsPage.clickFinishButton()

      // check summary and location value
      await expect(atsPage.tableStatus).toBeVisible()

      const jobs = [
         { name: "Job 1", description: "Job description 1" },
         { name: "Job 2", description: "Job description 2" },
         { name: "Job 3", description: "Job description 3" },
         { name: "Job 4", description: "Job description 4" },
         { name: "Job 5", description: "Job description 5" },
      ]
      const allJobsExist = await atsPage.checkJobsExist(jobs)
      expect(allJobsExist).toBe(true)

      await atsPage.page.pause()
   })
})

const credentials = {
   apiKey: "088ec780160bea9d7d3b23dca4966889-3",
}
