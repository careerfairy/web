import { Locator, Page } from "@playwright/test"
import { expect } from "@playwright/test"
import { Group } from "@careerfairy/shared-lib/groups"
import { CommonPage } from "./CommonPage"
import { sleep } from "../utils"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import DateUtil from "../../../util/DateUtil"
import { Speaker } from "@careerfairy/shared-lib/dist/livestreams"
import { imageLogoPath } from "../../constants"

export class GroupDashboardPage extends CommonPage {
   public inviteMemberButton: Locator
   public kickFromDashboard: Locator

   constructor(public readonly page: Page, protected readonly group: Group) {
      super(page)

      this.inviteMemberButton = this.page.getByRole("button", {
         name: "Invite a Member",
      })

      this.kickFromDashboard = this.page.getByRole("button", {
         name: "Kick from dashboard",
      })
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

   public topCreateLivestreamButton() {
      return this.page
         .getByRole("banner")
         .getByRole("button", { name: "Create New Live Stream" })
   }

   public async goToCompanyPage() {
      await this.goToPage("Company")
   }

   public async goToMembersPage() {
      await this.goToPage("Team members")
   }

   public async goToLivestreams() {
      await this.goToPage("Live streams")
   }

   public async clickDraftsTab() {
      await this.page.getByRole("tab", { name: "Drafts" }).click()
   }

   public async inviteGroupAdmin(email: string) {
      await this.inviteMemberButton.click()

      await this.page.getByLabel("Email *").fill(email)
      await this.page.getByRole("button", { name: "Send Invite" }).click()
   }

   public async assertGroupDashboardIsOpen() {
      await expect(this.topCreateLivestreamButton()).toBeVisible()
      await this.assertMainPageHeader()
   }

   public async clickCreateNewLivestreamTop() {
      await this.page
         .getByRole("banner")
         .getByRole("button", { name: "Create New Live Stream" })
         .click()
   }

   public async fillLivestreamForm(data: Partial<LivestreamEvent>) {
      const matchById = {
         "#title": () => data.title,
         "#start": () => DateUtil.eventStartDate(data.start?.toDate?.()),
         "input[name=duration]": () => data.duration?.toString(),
         "#summary": () => data.summary,
         "#reasonsToJoinLivestream": () => data.reasonsToJoinLivestream,
      }

      // fill inputs fields by id
      for (const [id, value] of Object.entries(matchById)) {
         const val = value() // calculate the value
         if (val) {
            await this.page.locator(id).fill(val)
         }
      }

      if (data.speakers) {
         await this.fillSpeakerDetails(data.speakers)
      }

      if (data.interestsIds?.length > 0) {
         await this.selectInterests(data.interestsIds)
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

   private async goToPage(name: "Company" | "Team members" | "Live streams") {
      await Promise.all([
         this.page.waitForNavigation(),
         this.page.getByRole("link", { name }).click(),
      ])
   }
}
