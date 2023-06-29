import { Locator, expect } from "@playwright/test"
import { CommonPage, handleMultiSelect } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"
import greenhouseResponse from "../../assets/greenhouseResponse.json"
import linkInitiateResponse from "../../assets/mergeLinkInitiate.json"

export class ATSAdminPage extends CommonPage {
   public testApplicationJobsSelect: Locator
   public syncStatusHeader: Locator

   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)

      this.testApplicationJobsSelect = this.page.locator(
         'input[name="application-test-jobs"]'
      )

      this.syncStatusHeader = this.page.getByText(
         "First Synchronization In Progress"
      )
   }

   public async linkAccount() {
      await this.page
         .getByRole("button", { name: "LINK ACCOUNT" })
         .first()
         .click()
   }

   public async clickFinishButton() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByText("Finish")
         .click()
   }

   public async checkJobsExistInTable(
      jobs: {
         name: string
         description: string
      }[]
   ): Promise<void> {
      await Promise.all(
         jobs.map(async (job) => {
            const jobRow = this.page
               .locator(
                  `//td[text()='${job.name}']/following-sibling::td/div[text()='${job.description}']`
               )
               .first()
            return expect(jobRow).toBeVisible()
         })
      )
   }

   async mockATSInitiationRequest() {
      await this.page.route(
         "https://api.merge.dev/api/integrations/link/*/initiate",
         async (route) => {
            await route.fulfill({
               status: 200,
               body: JSON.stringify(linkInitiateResponse),
            })
         }
      )
   }

   async mockLinkedAccountRequest() {
      await this.page.route(
         "https://api.merge.dev/api/integrations/linked-account",
         async (route) => {
            await route.fulfill({
               status: 200,
               body: JSON.stringify(greenhouseResponse),
            })
         }
      )
   }

   async mockFetchATSSyncStatusRequest() {
      const syncStatusResponse = this.buildInitialSyncStatuses()

      let requestCount = 0

      await this.page.route("**/fetchATSSyncStatus_eu", async (route) => {
         await route.fulfill({
            status: 200,
            body: JSON.stringify({ result: syncStatusResponse }),
         })

         requestCount++
         // On the first request, set half of the models to "DONE" state.
         // On the second request, set all of the remaining models to "DONE" state.
         const modelsToUpdate =
            requestCount === 1
               ? syncStatusResponse.length / 2
               : syncStatusResponse.length

         for (let i = 0; i < modelsToUpdate; i++) {
            if (i < syncStatusResponse.length) {
               syncStatusResponse[i].status = "DONE"
            }
         }
      })
   }

   private buildInitialSyncStatuses(): SyncStatusResponse[] {
      const models = [
         "Activity",
         "Application",
         "Attachment",
         "Candidate",
         "Department",
         "EmailAddress",
         "Job",
         "JobInterviewStage",
      ] as const

      return models.map((model) => ({
         hydrated: true,
         id: `ats.${model}`,
         model: model,
         status: "SYNCING",
         isInitialSync: true,
         lastSync: Date.now(),
         nextSync: Date.now() + 60 * 60 * 1000, // 1 hour from now
      }))
   }

   public async startApplicationTest() {
      await this.page.getByRole("button", { name: "Application Test" }).click()
   }

   public async selectJobForApplicationTest(jobName: string) {
      await handleMultiSelect(
         jobName,
         this.testApplicationJobsSelect,
         this.page
      )
   }

   public async completeApplicationTest() {
      await this.page.getByRole("button", { name: "Test" }).click()
   }

   /*
      |--------------------------------------------------------------------------
      | Merge Popup Methods
      |--------------------------------------------------------------------------
      */
   public async selectATS() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByRole("button", { name: "Greenhouse" })
         .click()
   }

   public async enterAPIKey(apiKey: string) {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByPlaceholder("Greenhouse API key")
         .fill(apiKey)
   }

   public async finishAndCloseMergeDialog() {
      await this.clickContinueButton() // First continue button
      await this.clickContinueButton() // Second continue button
      await this.clickFinishButton() //
   }

   public async submitAPIKey() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByRole("button", { name: "Submit" })
         .click()
   }

   private async clickContinueButton() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByRole("button", { name: "Continue" })
         .click()
   }
}

type SyncStatusResponse = {
   hydrated: boolean
   id: string
   model: string
   status: string
   isInitialSync: boolean
   lastSync: number
   nextSync: number
}
