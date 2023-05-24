import { expect, test as base } from "@playwright/test"
import { Group } from "@careerfairy/shared-lib/groups"
import { GroupDashboardPage } from "../../page-object-models/GroupDashboardPage"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import { LoginPage } from "../../page-object-models/LoginPage"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { sleep } from "../../utils"

/**
 * Group Admin Test Fixture
 * Creates a group and a user (group owner) and logs in the user
 */

const test = base.extend<{
   group: Group
   groupPage: GroupDashboardPage
}>({
   group: async ({}, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const group = await GroupSeed.createGroup()
      await use(group)
   },
   groupPage: async ({ page, group }, use) => {
      const groupPage = new GroupDashboardPage(page, group)
      await groupPage.setLocalStorageKeys()

      const newUrl = `/group/${group.id}/admin`
      await LoginPage.login(page, { waitForURL: newUrl })

      await use(groupPage)
   },
})

test.describe("Company page", () => {
   test("Update company page description and location", async ({
      groupPage,
   }) => {
      const summary = "this is a test summary"
      const location = "Portugal"

      await groupPage.goToCompanyPage()

      // edit summary
      await groupPage.updateCompanySummary(summary)
      // edit location
      await groupPage.updateCompanyLocation(location)
      // click on save
      await groupPage.saveCompanyDetails()

      // refresh
      await groupPage.page.reload()

      // check summary and location value
      await expect(groupPage.companyInformationSummaryInput).toHaveText(summary)
      await expect(groupPage.companyInformationLocationInput).toHaveValue(
         location
      )
   })
   test("Create add publish company page", async ({ groupPage, group }) => {
      await groupPage.goToCompanyPage()
      await groupPage.goToCompanyPageAdmin()

      // open about dialog and fill all the information
      await groupPage.openAndFillAboutInformation()

      // open testimonial dialog and create one
      await groupPage.openAndFillTestimonial()

      // fill required photos
      await groupPage.addCompanyPhotos()

      // add video
      await groupPage.addCompanyVideo()

      await sleep(1000)

      // go to preview company page
      await groupPage.goToPreviewCompanyPageAdmin(
         companyNameSlugify(group.universityName)
      )
      // expect company name to be on the preview page
      await expect(
         groupPage.page.getByRole("heading", { name: group.universityName })
      ).toBeVisible()
      // expects edit button to be hidden
      await expect(
         groupPage.companyPageTestimonialSectionEditButton
      ).not.toBeVisible()
   })
})
