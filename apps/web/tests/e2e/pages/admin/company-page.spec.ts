import { expect } from "@playwright/test"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { sleep } from "../../utils"
import { groupAdminFixture as test } from "../../fixtures"

test.describe("Company page creation", () => {
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
test.describe("Company page follow", () => {
   test.use({ options: { completedGroup: true, createUser: true } })
   test("Follow company from a the dedicated company page", async ({
      groupPage,
      group,
   }) => {
      await groupPage.goToCompanyPage()
      await groupPage.goToCompanyPageAdmin()

      await sleep(1000)

      await groupPage.goToPreviewCompanyPageAdmin(
         companyNameSlugify(group.universityName)
      )

      // click on follow button
      await groupPage.clickOnHeaderFollowButton()

      await groupPage.expectFollowingCompanyButtonToBeVisible()
   })
   test("Follow company from companies page", async ({ groupPage }) => {
      await groupPage.goToCompanyPage()
      await groupPage.goToCompanyPageAdmin()
      await sleep(1000)

      await groupPage.goToCompaniesPage()
      await groupPage.clickOnFollowOnCompaniesPage()

      await groupPage.expectFollowingButtonToBeVisibleOnCompanies()
   })
})
