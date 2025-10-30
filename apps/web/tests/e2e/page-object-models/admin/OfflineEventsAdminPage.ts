import { expect, Locator } from "@playwright/test"
import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class OfflineEventsAdminPage extends CommonPage {
   public readonly statusFilterButton: Locator
   public readonly applyFilterButton: Locator
   public readonly searchField: Locator
   public readonly startPromotingButton: Locator
   public readonly checkoutDialog: Locator

   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)

      this.statusFilterButton = this.page.getByRole("button", {
         name: "Status",
      })
      this.applyFilterButton = this.page.getByRole("button", { name: "Apply" })
      this.searchField = this.page.getByPlaceholder("Search")
      this.startPromotingButton = this.page
         .getByRole("button")
         .filter({ hasText: "Start promoting now" })
         .first()
      this.checkoutDialog = this.page.locator('[role="dialog"]')
   }

   // Filter methods
   public async filterByStatus(status: "Upcoming" | "Draft" | "Past") {
      await this.statusFilterButton.click()
      await this.page.getByRole("menuitem", { name: status }).click()
      await this.applyFilterButton.click()
   }

   // Event table interaction methods
   public async assertEventIsVisible(title: string) {
      const eventCell = this.page.getByRole("cell", { name: title })
      return expect(eventCell).toBeVisible()
   }

   public async goBackToEventsList() {
      await this.page.getByText("Offline event creation").click()
   }

   // Promotion page methods
   public async assertPromotionViewIsVisible() {
      await expect(
         this.page.getByText("Bring your campus events to the right students")
      ).toBeVisible()
      await expect(this.startPromotingButton).toBeVisible()
   }

   public async clickStartPromotingNow() {
      await this.startPromotingButton.first().click()
   }

   // Table view methods
   public async assertAvailableEventsCount(count: number) {
      await expect(
         this.page.getByText(`${count} events available`)
      ).toBeVisible()
   }

   public async clickPromoteMoreEventsButton() {
      await this.page
         .getByRole("button")
         .filter({ hasText: "Promote more events" })
         .click()
   }

   public async clickCreateOfflineEventButton() {
      await this.page
         .getByRole("button")
         .filter({ hasText: "Create offline event" })
         .click()
   }

   // Out of events dialog methods
   public async clickPromoteMoreEventsInDialog() {
      await this.page
         .getByRole("button")
         .filter({ hasText: /Promote more offline events/ })
         .click()
   }

   public async waitForOutOfEventsDialog() {
      await expect(this.page.getByText("No offline events left")).toBeVisible()
   }

   // Checkout dialog methods
   public async waitForCheckoutDialog(hasPromotionDialog: boolean = false) {
      await expect(
         this.checkoutDialog.nth(hasPromotionDialog ? 1 : 0)
      ).toBeVisible()

      await expect(
         this.page.getByText("Plan your next offline events")
      ).toBeVisible()
   }

   public async waitForStripeCheckout() {
      await expect(
         this.page
            .frameLocator('iframe[name="embedded-checkout"]')
            .getByTestId("product-summary-name")
            .getByText("Offline Event (test product)", { exact: true })
      ).toBeVisible()
   }

   // Form methods
   public async fillOfflineEventForm(data: {
      title?: string
      description?: string
      address?: string
      registrationUrl?: string
   }) {
      if (data.title) {
         await this.page.getByLabel("Event name").fill(data.title)
      }
      if (data.description) {
         await this.page.getByLabel("Event description").fill(data.description)
      }
      if (data.address) {
         const addressInput = this.page.getByLabel("Address")
         // Fill the address input which triggers Mapbox suggestions
         await addressInput.fill(data.address)

         const listbox = this.page.getByRole("listbox", {
            name: "Address (required)",
         })
         // Wait for the dropdown to open by checking aria-expanded attribute
         await listbox.waitFor({ state: "attached" })
         await expect(listbox).toBeVisible()

         // Wait for at least one option to be visible
         await expect(listbox.locator('[role="option"]').first()).toBeVisible()

         // Click the first option
         await listbox.locator('[role="option"]').first().click()
      }
      if (data.registrationUrl) {
         await this.page
            .getByLabel("Registration Link")
            .fill(data.registrationUrl)
      }
   }

   public async uploadBannerImage(path: string) {
      await this.clickAndUploadFiles(
         this.page.getByRole("button", { name: "Upload banner" }),
         path
      )

      const applyButton = this.page.getByRole("button", { name: "Apply" })

      await applyButton.waitFor({ state: "visible" })
      await applyButton.click()
   }

   public async fillStartDate() {
      // Click the calendar icon to open the date picker
      await this.page.getByLabel("Choose date").click()

      // Click next month button
      await this.page.getByLabel("Next month").click()

      // Select the 23rd day
      await this.page.getByRole("gridcell", { name: "23" }).first().click()

      // Click OK to confirm
      await this.page.getByRole("button", { name: "OK" }).click()
   }

   public async clickPublishButton() {
      await this.page.getByRole("button", { name: "Publish" }).click()
   }

   public async confirmPublish() {
      await expect(this.page.getByText("Publish Offline Event")).toBeVisible()

      await this.page
         .getByRole("button", { name: "Publish", exact: true })
         .last()
         .click()
   }

   public async waitForPublishSuccess() {
      await expect(
         this.page.getByText("Offline event published successfully!")
      ).toBeVisible()
   }
}
