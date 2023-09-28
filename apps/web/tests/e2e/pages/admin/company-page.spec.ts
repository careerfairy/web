import { expect } from "@playwright/test"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { sleep } from "../../utils"
import { groupAdminFixture as test } from "../../fixtures"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import UserSeed from "@careerfairy/seed-data/dist/users"

test.describe("Company page creation", () => {
   test.skip("Update company page description and location", async ({
      groupPage,
      group,
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

      // get updated group
      const updatedGroup = await GroupSeed.getGroup(group.groupId)

      // expect the group document has the fields updated
      expect(updatedGroup.extraInfo).toBe(summary)
      expect(updatedGroup.companyCountry.name).toBe(location)
   })
   test("Create and publish company page", async ({
      groupPage,
      group,
      browserName,
   }) => {
      test.skip(
         browserName === "webkit",
         "Failing in webkit for some reason, 404 after opening company page"
      )

      await groupPage.goToCompanyPage()
      await groupPage.goToCompanyPageAdmin()

      // open about dialog and fill all the information
      await groupPage.openAndFillAboutInformation()

      // open testimonial dialog and create one
      await groupPage.openAndFillTestimonial()

      // fill required photos
      await groupPage.addCompanyPhotos()

      // Ensure the toast is visible, it's a sign that the photos were added
      await groupPage.assertTextIsVisible("Photos updated successfully")

      // add video
      await groupPage.addCompanyVideo()

      // Ensure the toast is visible, it's a sign that the video was added
      await groupPage.assertTextIsVisible("Video added successfully")

      // go to preview company page
      await groupPage.goToPreviewCompanyPageAdmin(
         companyNameSlugify(group.universityName)
      )

      // expect company name to be on the preview page
      await expect(
         groupPage.page.getByRole("heading", { name: group.universityName })
      ).toBeVisible()

      // get updated group
      const updatedGroup = await GroupSeed.getGroup(group.groupId)

      // expect updated company to have all the fields required to be a public profile
      expect(updatedGroup.publicProfile).toBeTruthy()

      // expects edit button to be hidden
      await expect(
         groupPage.companyPageTestimonialSectionEditButton
      ).not.toBeVisible()
   })
})
test.describe("Company page follow", () => {
   // Only run those tests on chromium
   test.skip(({ browserName }) => browserName !== "chromium")

   test.use({ options: { completedGroup: true, createUser: true } })
   test("Follow company from a the dedicated company page", async ({
      groupPage,
      group,
      user,
   }) => {
      await groupPage.goToCompanyPage()
      await groupPage.goToCompanyPageAdmin()

      await groupPage.goToPreviewCompanyPageAdmin(
         companyNameSlugify(group.universityName)
      )

      // click on follow button
      await groupPage.clickOnHeaderFollowButton()

      await expect(groupPage.companyUnfollowButton.first()).toBeVisible()

      // get user follow companies
      const followedCompanies = await UserSeed.getUserFollowedCompanies(
         user.userEmail
      )

      // expect group to be on the user companies follow list
      expect(followedCompanies[0].groupId).toBe(group.groupId)
   })
   test("Follow company from companies page", async ({
      groupPage,
      user,
      group,
   }) => {
      await groupPage.goToCompanyPage()
      await groupPage.goToCompanyPageAdmin()

      await groupPage.goToCompaniesPage()

      await groupPage.clickOnFollowOnCompaniesPage()

      await expect(groupPage.companyUnfollowButton).toBeVisible()

      // get user followed companies
      const followedCompanies = await UserSeed.getUserFollowedCompanies(
         user.userEmail
      )

      // expect group to be on the follow list
      expect(followedCompanies[0].groupId).toBe(group.groupId)
   })
})
