import { Locator, Page } from "@playwright/test"
import { expect } from "@playwright/test"
import { Group } from "@careerfairy/shared-lib/groups"
import { CommonPage} from "./CommonPage"
import {
   LivestreamEvent,
   LivestreamJobAssociation,
} from "@careerfairy/shared-lib/livestreams"
import DateUtil from "../../../util/DateUtil"
import { Speaker } from "@careerfairy/shared-lib/dist/livestreams"
import { correctCompany, imageLogoPath } from "../../constants"
import { LivestreamsAdminPage } from "./admin/LivestreamsAdminPage"
import { sleep } from "../utils"
import { ATSAdminPage } from "./admin/ATSAdminPage"

export class GroupDashboardPage extends CommonPage {
   public inviteMemberButton: Locator
   public kickFromDashboard: Locator
   public companyInformationSummaryInput: Locator
   public companyInformationLocationInput: Locator
   public companyInformationIndustriesInput: Locator
   public companyInformationSizeInput: Locator
   public companyInformationAboutInput: Locator
   public companyPageTestimonialSectionEditButton: Locator
   /*
    * Follow button that can be found on the company B2C page or on the company cards at /companies
    * */
   public companyFollowButton: Locator
   public companyUnfollowButton: Locator
   public nonAuthedCompanyFollowButton: Locator

   constructor(public readonly page: Page, protected readonly group: Group) {
      super(page)

      this.inviteMemberButton = this.page.getByRole("button", {
         name: "Invite a Member",
      })

      this.kickFromDashboard = this.page.getByRole("button", {
         name: "Kick from dashboard",
      })

      this.companyInformationSummaryInput =
         this.page.getByLabel("Group Summary *")

      this.companyInformationLocationInput =
         this.page.getByLabel("Company location")

      this.companyInformationIndustriesInput =
         this.page.getByLabel("Company industries")

      this.companyInformationSizeInput = this.page.getByRole("button", {
         name: "Company size *",
      })

      this.companyInformationAboutInput = this.page.getByLabel("About *")

      this.companyPageTestimonialSectionEditButton = this.page.locator(
         "data-testid=testimonial-section-edit-button"
      )

      this.companyFollowButton = this.page.getByRole("button", {
         name: "Follow",
         disabled: false, // This prevents playwright from clicking on the disabled follow button at it is disabled on first mount as it is suspensefuly fetching the following status.
      })

      this.companyUnfollowButton = this.page.getByRole("button", {
         name: "Following",
         disabled: false, // This prevents playwright from clicking on the disabled follow button at it is disabled on first mount as it is suspensefuly fetching the following status.
      })

      this.nonAuthedCompanyFollowButton = this.page.getByTestId(
         "non-authed-follow-button"
      )
   }

   /**
    * Set some flags in local storage to prevent tooltips from showing up
    */
   async setLocalStorageKeys() {
      await this.page.addInitScript(() => {
         window.localStorage.setItem("has-seen-company-page-cta", "true")
      })
   }

   async open() {
      await this.page.goto(`/group/${this.group.id}/admin`)
   }

   public assertMainPageHeader() {
      return this.assertTextIsVisible("Main Page")
   }

   public async assertGroupDashboardIsOpen() {
      await expect(this.topCreateLivestreamButton()).toBeVisible()
      await this.assertMainPageHeader()
   }

   public topCreateLivestreamButton() {
      return this.page
         .getByRole("banner")
         .getByRole("button", { name: "Create New Live Stream" })
   }

   // Navigation

   public async goToCompanyPage() {
      await this.goToPage("Company")
   }

   public async goToMembersPage() {
      await this.goToPage("Team members")
   }

   public async goToLivestreams() {
      await this.goToPage("Live streams")

      return new LivestreamsAdminPage(this)
   }

   public async goToATSPage() {
      await this.goToPage("ATS Integration")

      return new ATSAdminPage(this)
   }

   // Team Members page

   public async goToCompanyPageAdmin() {
      await this.goToPage("Company page")
   }

   public async goToCompaniesPage() {
      await this.page.goto(`/companies`)
   }

   public async goToPreviewCompanyPageAdmin(companyName: string) {
      await this.page.goto(`/company/${companyName}`)
   }

   public async inviteGroupAdmin(email: string) {
      await this.inviteMemberButton.click()

      await this.page.getByLabel("Email *").fill(email)
      await this.page.getByRole("button", { name: "Send Invite" }).click()
   }

   // Livestream Modal Form

   public async clickCreateNewLivestreamTop() {
      await this.page
         .getByRole("banner")
         .getByRole("button", { name: "Create New Live Stream" })
         .click()
   }

   public async fillLivestreamForm(data: Partial<LivestreamEvent>) {
      const matchById = {
         "#title": () => data.title,
         "#start": () =>
            data.start
               ? DateUtil.eventStartDate(data.start?.toDate?.())
               : undefined,
         "input[name=duration]": () => data.duration?.toString(),
         "#summary": () => data.summary,
         "#reasonsToJoinLivestream": () => data.reasonsToJoinLivestream,
      }

      // fill inputs fields by id
      for (const [id, value] of Object.entries(matchById)) {
         const val = value() // calculate the value
         if (val) {
            // force because the input might be readonly (date picker)
            await this.page.locator(id).fill(val, { force: true })
         }
      }

      if (data.speakers) {
         await this.fillSpeakerDetails(data.speakers)
      }

      if (data.interestsIds?.length > 0) {
         await this.selectInterests(data.interestsIds)
      }

      if (data.jobs?.length > 0) {
         await this.selectJobs(data.jobs)
      }
   }

   public async selectInterests(interests: string[]) {
      await this.page
         .getByPlaceholder("Choose 5 categories that best describe this event")
         .click()

      for (const interest of interests) {
         await this.page.getByTestId(`interestsIds_${interest}_option`).click()
      }
   }

   /**
    * Selects the jobs from the dropdown, currently you can only select one job
    * */
   public async selectJobs(jobs: LivestreamJobAssociation[]) {
      await this.page.getByPlaceholder("Select one job").click()

      for (const job of jobs) {
         await this.page.getByTestId(`jobIds_${job.jobId}_option`).click()
      }
   }

   public async fillSpeakerDetails(speakers: Speaker[]) {
      if (speakers.length > 1) {
         // add extra speakers slots
         let idx = speakers.length - 1
         while (idx-- > 0) {
            await this.page
               .getByRole("button", { name: "Add a Speaker" })
               .click()
         }
      }

      for (let i = 0; i < speakers.length; i++) {
         const speaker = speakers[i]

         const placeholders = {
            "Enter the speaker’s first name": () => speaker.firstName,
            "Enter the speaker’s last name": () => speaker.lastName,
            "Enter the speaker’s position": () => speaker.position,
            "Enter the speaker’s academic background": () => speaker.background,
            "Enter the speaker’s email address": () => speaker.email,
         }

         // fill speaker fields
         for (const [placeholder, value] of Object.entries(placeholders)) {
            const val = value() // calculate the value
            if (val) {
               await this.page.getByPlaceholder(placeholder).nth(i).fill(val)
            }
         }

         // upload avatar
         await this.clickAndUploadFiles(
            this.page.getByRole("button", { name: "Upload Avatar" }).nth(0),
            imageLogoPath
         )
      }
   }

   public async clickCreateDraft() {
      await this.page.getByRole("button", { name: "Create draft" }).click()
   }

   public async clickPublish() {
      await this.page.locator("text=publish as stream").click()
   }

   public async clickManageLivestream() {
      await this.page
         .getByRole("button", { name: "Manage your live stream" })
         .click()
   }

   public async clickUpdate() {
      await this.page.getByRole("button", { name: "update and close" }).click()
   }

   private async goToPage(
      name:
         | "Company"
         | "Team members"
         | "Live streams"
         | "Company page"
         | "ATS Integration"
   ) {
      await Promise.all([
         this.page.waitForNavigation(),
         this.page.getByRole("link", { name }).click(),
      ])
   }

   async updateCompanySummary(summary: string) {
      return this.companyInformationSummaryInput.fill(summary)
   }

   async updateCompanyLocation(country: string) {
      return this.handleMultiSelect(
         country,
         this.companyInformationLocationInput
      )
   }

   async saveCompanyDetails() {
      await this.page.locator("data-testid=profile-details-save-button").click()
      return await sleep(1000)
   }

   async openAndFillAboutInformation() {
      await this.page.locator("data-testid=about-section-edit-button").click()
      await sleep(1000)

      await this.companyInformationAboutInput.fill(
         "CareerFairy is the only graduate career portal that gives graduates access to speak to companies before applying for a job. We find and share valuable insights about the job market, career choices and, most importantly, employers."
      )
      await this.handleMultiSelect(
         correctCompany.location,
         this.companyInformationLocationInput
      )
      await this.handleMultiSelect(
         correctCompany.industry,
         this.companyInformationIndustriesInput
      )

      await this.companyInformationSizeInput.click()
      await this.page.getByRole("option", { name: "1-20 employees" }).click()

      await this.page.locator("data-testid=about-section-save-button").click()
      return await sleep(1000)
   }

   async openAndFillTestimonial() {
      await this.companyPageTestimonialSectionEditButton.click()

      // upload avatar
      await this.clickAndUploadFiles(
         this.page.locator("data-testid=image-selector-upload"),
         imageLogoPath
      )
      await sleep(1000)

      await this.page
         .getByPlaceholder("Say something about their story")
         .fill(
            "I am about to finish my Bachelor’s degree in Applied Linguistics at ZHAW. I wanted to start my professional career in an environment that values my ideas and ultimately helps students, like me, to make their first steps in their professional world."
         )
      await this.page.getByLabel("Name").fill("Fabian Doe")
      await this.page
         .getByLabel("Position")
         .fill("Business Development Manager")
      await this.page.locator("data-testid=testimonials-save-button").click()
   }

   async addCompanyPhotos() {
      // upload 3 photos
      await this.clickAndUploadFiles(
         this.page.getByRole("button", { name: "ADD PHOTO" }),
         imageLogoPath
      )
      await this.clickAndUploadFiles(
         this.page.getByRole("button", { name: "ADD PHOTO" }),
         imageLogoPath
      )
      await this.clickAndUploadFiles(
         this.page.getByRole("button", { name: "ADD PHOTO" }),
         imageLogoPath
      )
   }

   async addCompanyVideo() {
      await this.page.getByRole("button", { name: "ADD VIDEO" }).click()

      await this.page
         .getByPlaceholder("Enter the title of video")
         .fill("this it the title")
      await this.page
         .getByPlaceholder("Enter the video description")
         .fill("this is a description")
      await this.page.getByLabel("Embed Video").check()
      await this.page
         .getByLabel("Paste video URL here")
         .fill("https://www.youtube.com/")
      await this.page.getByRole("button", { name: "Save & Close" }).click()
   }

   async clickOnHeaderFollowButton() {
      await this.companyFollowButton.first().click()
   }

   async clickOnFollowOnCompaniesPage() {
      await this.companyFollowButton.click()
   }
}
