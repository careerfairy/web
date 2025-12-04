import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent, Speaker } from "@careerfairy/shared-lib/livestreams"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { UserData } from "@careerfairy/shared-lib/users"
import { Locator, Page, expect } from "@playwright/test"
import DateUtil from "util/DateUtil"
import { correctCompany, imageLogoPath } from "../../constants"
import { sleep } from "../utils"
import { CommonPage } from "./CommonPage"
import { FeedbackPage } from "./admin/FeedbackPage"
import { LivestreamsAdminPage } from "./admin/LivestreamsAdminPage"
import { OfflineEventsAdminPage } from "./admin/OfflineEventsAdminPage"

type FillLivestreamFormOptions = {
   publish?: boolean
   customJobs?: CustomJob[]
}

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

      this.companyInformationSizeInput = this.page.getByLabel("Company size *")

      this.companyInformationAboutInput = this.page.locator(".ql-editor")

      this.companyPageTestimonialSectionEditButton = this.page.locator(
         "data-testid=testimonial-section-edit-button"
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
      return this.page.getByRole("heading", { name: "Dashboard" }).isVisible()
   }

   public async assertGroupDashboardIsOpen() {
      await expect(this.topCreateLivestreamButton()).toBeVisible()
      await this.assertMainPageHeader()
   }

   public topCreateLivestreamButton() {
      return this.page
         .getByRole("banner")
         .getByRole("button", { name: "Create" })
   }

   // Navigation

   public async goToCompanyPage() {
      // Company settings are now under Settings section
      await this.goToPage("Settings")
      // This will go to Settings and should default to General tab
   }

   public async goToMembersPage() {
      // Team members is now under Settings sub-navigation
      await this.goToPage("Settings")
      // Wait for sub-navigation to load and click Team members tab
      await this.page.getByRole("link", { name: "Team members" }).click()
   }

   public async goToLivestreams() {
      // Live streams is now under Content section
      await this.goToPage("Content")
      // The Content section should default to Live streams tab

      return new LivestreamsAdminPage(this)
   }

   public async goToOfflineEvents() {
      // Offline events is under Content section
      await this.goToPage("Content")
      // Navigate to Offline events tab
      await this.page.getByRole("link", { name: "Offline events" }).click()

      return new OfflineEventsAdminPage(this)
   }

   public async clickQuickActionsOfflineEvent() {
      // Click "Publish an offline event" button from QuickActions
      await this.page
         .getByRole("button")
         .filter({ hasText: "Publish an offline event" })
         .click()

      return new OfflineEventsAdminPage(this)
   }

   public async clickCreateMenuOfflineEvent() {
      // Click the create menu button (top right, with + icon)
      await this.page.getByRole("button", { name: "Create" }).first().click()

      // Wait for menu to open and click "Offline event"
      await this.page.getByRole("menuitem", { name: "Offline event" }).click()

      return new OfflineEventsAdminPage(this)
   }

   // Analytics page

   public async goToAnalyticsPage() {
      await this.goToPage("Analytics")
   }

   public async goToTalentPoolAnalyticsPage() {
      await this.goToPage("Talent Pool")
   }

   public async goToLivestreamAnalyticsPage() {
      await this.goToPage("Live stream analytics")
   }

   public async goToFeedbackAnalyticsPage() {
      await this.goToPage("Feedback")

      return new FeedbackPage(this)
   }

   // Team Members page

   public async goToCompanyPageAdmin() {
      // Company page is now called Company Profile
      await this.goToPage("Company Profile")
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
         .getByRole("button", { name: "Create" })
         .click()

      // After clicking Create, we need to select the livestream option from the menu
      await this.page.getByRole("menuitem", { name: "Live stream" }).click()
   }

   public async fillLivestreamForm(
      data: Partial<LivestreamEvent>,
      options?: FillLivestreamFormOptions
   ) {
      const opts = options || {}
      const SUMMARY_PLACEHOLDER = `Describe your live stream
  • [Company] is one of the leading companies in the [industry]. We have [XYZ] employees globally...
  • We are going to present how a day in the life of our consultants looks like
  • Agenda: 30 minutes presentation and 30 minutes Q&A`

      const placeholders = {
         "Insert your live stream title": () => data.title,
         [SUMMARY_PLACEHOLDER]: () => data.summary,
         "Insert date": () =>
            data.start
               ? DateUtil.eventStartDate(data.start?.toDate?.())
               : undefined,
         "1 hour": () => data.duration?.toString(),
         "E.g., Find out, which job benefits await you as a [title of open position/program]":
            () =>
               (data.reasonsToJoinLivestream_v2?.length &&
                  data.reasonsToJoinLivestream_v2.at(0)) ||
               "",
         "E.g., Learn what skills from your studies you can apply in this working environment.":
            () =>
               (data.reasonsToJoinLivestream_v2?.length > 1 &&
                  data.reasonsToJoinLivestream_v2.at(1)) ||
               "",
         "E.g., Start job application process in-stream and skip first round of interviews.":
            () =>
               (data.reasonsToJoinLivestream_v2?.length > 2 &&
                  data.reasonsToJoinLivestream_v2.at(2)) ||
               "",
      }

      // fill inputs with placeholders
      for (const [placeholder, value] of Object.entries(placeholders)) {
         const val = value() // calculate the value
         if (val) {
            // force because the input might be readonly (date picker)
            await this.page
               .getByPlaceholder(placeholder)
               .fill(val, { force: true })
         }
      }

      const tagValueLooker = (tagId) => TagValuesLookup[tagId]

      await this.fillMultiSelect(
         "Choose at least 1 topic describing the content of the live stream",
         data.contentTopicsTagIds,
         tagValueLooker
      )

      await this.fillMultiSelect(
         "Choose at least 1 business function presented in this live stream",
         data.businessFunctionsTagIds,
         tagValueLooker
      )

      await this.fillMultiSelect("Select fields of study", data.fieldOfStudyIds)

      await this.fillMultiSelect("Select levels of study", data.levelOfStudyIds)

      if (data.speakers) {
         await this.clickNextButton()
         await this.skipRequiredFields()
         await this.createSpeakers(data.speakers)
      }

      // Select custom jobs if provided
      if (opts.customJobs?.length) {
         await this.selectCustomJobs(opts.customJobs)
      }

      await expect(
         this.page.getByText(`${data.isDraft ? "Draft" : "Changes"} saved`)
      ).toBeVisible()

      if (opts.publish) {
         const isPublishDisabled = await this.page
            .getByRole("button", { name: "Publish" })
            .isDisabled()

         await expect(isPublishDisabled).toBe(false)

         if (!isPublishDisabled) {
            await this.page.getByRole("button", { name: "Publish" }).click()

            const isConfirmPublishVisible = await this.page.getByRole(
               "heading",
               { name: "Ready to publish?" }
            )

            if (isConfirmPublishVisible) {
               await this.page.getByRole("button", { name: "Publish" }).click()
            }
         }
      }
   }

   public async skipRequiredFields() {
      const isGeneralTabInvalid = await this.page
         .getByRole("heading", { name: "Required fields missing" })
         .isVisible()

      if (isGeneralTabInvalid) {
         await this.page.getByRole("button", { name: "Skip for now" }).click()
      }
   }
   /**
    * Selects the jobs from the dropdown, currently you can only select one job
    * */

   public async assertJobIsAttachedToStream(jobLinks: string[]) {
      await this.clickJobOpenings()
      await this.skipRequiredFields()

      for (const link of jobLinks) {
         await expect(this.page.getByRole("link", { name: link })).toBeVisible()
      }
   }

   /**
    * Fills a multi select, beware if called for the new live stream creation form, if already filled it will deselect the items.
    * The manipulation is done via deleting fields of the provided data but an improvement can be made for checking if the item is already selected.
    */
   public async fillMultiSelectTagCategories(
      dropdownId: string,
      tagIds: string[]
   ) {
      if (tagIds?.length) {
         await this.page.locator(`input[id='${dropdownId}']`).click()

         await Promise.all(
            tagIds.map((tagId) => {
               return this.page
                  .getByRole("option", { name: TagValuesLookup[tagId] })
                  .click()
            })
         )

         await this.page.locator(`input[id='${dropdownId}']`).click()
      }
   }

   /**
    * Fills a multi select, beware if called for the new live stream creation form, if already filled it will deselect the items.
    * The manipulation is done via deleting fields of the provided data but an improvement can be made for checking if the item is already selected.
    */
   public async fillMultiSelect(
      placeholder: string,
      options: string[],
      nameMapper?: (string) => string
   ) {
      if (options?.length) {
         await this.page.getByPlaceholder(placeholder).click()

         await Promise.all(
            options.map((option) => {
               const optionName = nameMapper ? nameMapper(option) : option
               return this.page
                  .getByRole("option", { name: optionName })
                  .click()
            })
         )

         await this.page.getByLabel("Close").click()
      }
   }

   public async clickNextButton() {
      return await this.page.locator("button[id='general.next']").click()
   }

   public async createSpeakers(speakers: Speaker[]) {
      if (speakers?.length) {
         for (const speaker of speakers) {
            await this.page.getByLabel("Open", { exact: true }).click()

            const existingSpeaker = await this.page
               .getByLabel("Speakers of this event")
               .getByText(`${speaker.firstName} ${speaker.lastName}`)

            const speakerExists = await existingSpeaker.isVisible()

            if (speakerExists) {
               await this.page.getByLabel("Close").click()
               continue
            }

            await this.page
               .getByRole("menuitem", { name: "Create a new contributor" })
               .click()

            const placeholders = {
               John: () => speaker.firstName,
               Doe: () => speaker.lastName,
               "E.g.,: Marketing Manager": () => speaker.position,
               "LinkedIn link": () => speaker.linkedInUrl,
               "E.g.,: John@careerfairy.io": () =>
                  `${speaker.firstName}-${Date.now()}@example.com`,
               "Tell talent a little more about your story and professional background!":
                  () => speaker.background,
            }

            // fill inputs with placeholders
            for (const [placeholder, value] of Object.entries(placeholders)) {
               const val = value() // calculate the value
               if (val) {
                  await this.page
                     .getByPlaceholder(placeholder, { exact: true })
                     .fill(val)
               }
            }

            await this.clickAndUploadFiles(
               this.page.getByRole("button", {
                  name: "Upload speaker picture",
               }),
               "tests/e2e/assets/creatorAvatar.png"
            )

            await this.page.getByRole("button", { name: "Create" }).click()

            // Wait for the create speaker dialog to fully close
            await this.page
               .getByRole("heading", { name: /Create.*new.*contributor/i })
               .waitFor({ state: "hidden" })
         }
      }
   }

   public async clickJobOpenings() {
      await this.page.getByRole("tab", { name: "Job openings" }).click()
   }

   /**
    * Selects the given custom jobs from the dropdown on the Job openings tab.
    * Uses expect assertions for proper Playwright waiting without explicit timeouts.
    */
   private async selectCustomJobs(customJobs: CustomJob[]) {
      // Early return if no custom jobs provided
      if (!customJobs?.length) {
         return
      }

      // Navigate to Job openings tab
      await this.clickJobOpenings()
      await this.skipRequiredFields()

      // Check if the dropdown exists and is visible
      const dropdown = this.page.getByPlaceholder(
         "Select jobs you want to attach"
      )
      await expect(dropdown).toBeVisible()

      // Click the dropdown to open it
      await dropdown.click()

      // Wait for the autocomplete options list to appear using expect
      const optionsList = this.page.locator('[role="listbox"]')
      await expect(optionsList).toBeVisible()

      // Select each custom job by its title
      for (const job of customJobs) {
         // Wait for the option with the job title to appear and be visible
         const jobOption = this.page
            .locator('[role="option"]')
            .filter({ hasText: job.title })
            .first()

         // Use expect to wait for the option to be visible
         await expect(jobOption).toBeVisible()
         await jobOption.click()
      }

      // Close the dropdown by pressing Escape
      await this.page.keyboard.press("Escape")
   }

   public async clickPublish() {
      await this.page.getByRole("button", { name: "Publish" }).click()
   }

   public async clickManageLivestream() {
      await this.page
         .getByRole("button", { name: "Manage your live stream" })
         .click()
   }

   private async goToPage(
      name:
         | "Dashboard"
         | "Content"
         | "Settings"
         | "Company Profile"
         | "Analytics"
         | "Talent Pool"
         | "Jobs"
         // Analytics sub-pages that might still be accessed directly
         | "Live stream analytics"
         | "Registration sources"
         | "Feedback"
         | "All live streams on CareerFairy"
   ) {
      await Promise.all([
         this.page.waitForNavigation(),
         this.page.getByRole("link", { name }).first().click(),
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
         .locator(".ql-editor")
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
      const addPhotoButton = this.page.getByRole("button", {
         name: "Add photo",
      })
      const photoFrames = this.page.locator(".photo-frame")
      const initialPhotoCount = await photoFrames.count()

      for (let index = 1; index <= 3; index++) {
         await this.clickAndUploadFiles(addPhotoButton, imageLogoPath)
         await expect(photoFrames).toHaveCount(initialPhotoCount + index)
      }
   }

   async addCompanyVideo() {
      await this.page.getByRole("button", { name: "Add video" }).click()

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

   async clickOnHeaderFollowButton(groupId: string) {
      await this.page.getByTestId(`follow-button-${groupId}`).first().click()
   }

   async clickOnFollowOnCompaniesPage(groupId: string) {
      const followButton = this.page
         .getByTestId(`follow-button-${groupId}`)
         .first()
      await followButton.scrollIntoViewIfNeeded()
      await followButton.click()
   }

   /**
    * Shared method that checks to see if a given analytic card is visible
    * */
   public async waitForAnalyticsCardVisible(options: {
      fields: {
         title?: string
         subheader?: string
         value?: string
      }
      simpleCard?: boolean
   }): Promise<void> {
      let filteredCards = this.page.getByTestId("card-custom")

      for (const field in options.fields) {
         const baseIdentifier = options.simpleCard ? "simple-card" : "card"
         const fullTestId = `${baseIdentifier}-${field}`

         // Filter the cards by the given fields
         filteredCards = filteredCards.filter({
            has: this.page.getByTestId(fullTestId).filter({
               hasText: new RegExp(`\\b${options.fields[field]}\\b`), // \b is a word boundary to prevent partial matches
            }),
         })
      }

      await expect(filteredCards).toBeVisible({
         timeout: 60000, // Give the trigger functions some time buffer to sync the live stream stats
      })
   }

   /**
    * Shared method that checks to see if a user's entry exists in an analytics table
    * */
   public async assertUserIsInAnalyticsTable(user: UserData) {
      const userFullName = `${user.firstName} ${user.lastName}`
      const userUniversityCountry =
         universityCountryMap?.[user.universityCountryCode] || ""

      const userRowSelector = `tr:has(div:has-text("${userFullName}")):has(td:has-text("${userUniversityCountry}")):has(td:has-text("${user.university.name}")):has(td:has-text("${user.fieldOfStudy.name}")):has(td:has-text("${user.levelOfStudy.name}"))`

      expect(this.page.locator(userRowSelector)).toBeVisible()
   }
}
