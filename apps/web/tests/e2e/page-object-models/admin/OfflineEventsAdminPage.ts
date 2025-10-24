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

   public async assertEventIsNotVisible(title: string) {
      const eventCell = this.page.getByRole("cell", { name: title })
      return expect(eventCell).not.toBeVisible()
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
         // Search for Lisbon since the company is set to Portugal
         await addressInput.fill("Lisbon")
         // Wait for dropdown to appear with suggestions
         await this.page.waitForTimeout(1000)
         // Select the first item in the dropdown
         await this.page.keyboard.press("ArrowDown")
         await this.page.keyboard.press("Enter")
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

      // Wait for the cropper dialog to appear
      await this.page.waitForTimeout(1000)

      // Click the Apply button to confirm the crop
      const applyButton = this.page.getByRole("button", { name: "Apply" })
      await applyButton.waitFor({ state: "visible", timeout: 5000 })
      await applyButton.click()

      // Wait for the upload to complete
      await this.page.waitForTimeout(1000)
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
      await expect(this.page.getByText("Publish Offline Event")).toBeVisible({
         timeout: 5000,
      })

      await this.page
         .getByRole("button", { name: "Publish", exact: true })
         .last()
         .click()
   }

   public async waitForPublishSuccess() {
      await expect(
         this.page.getByText("Offline event published successfully!")
      ).toBeVisible({ timeout: 10000 })
   }

   // Delete methods
   public async clickMoreActionsMenu(eventTitle: string) {
      const row = this.page.getByRole("row").filter({ hasText: eventTitle })
      await row
         .locator("button")
         .filter({ has: this.page.locator("svg") })
         .click()
   }

   public async clickDeleteInMenu() {
      await this.page.getByText("Delete event").click()
   }

   public async confirmDelete() {
      await expect(this.page.getByText("Delete this event?")).toBeVisible({
         timeout: 5000,
      })

      await this.page
         .getByRole("button", { name: "Delete", exact: true })
         .click()
   }

   public async waitForDeleteSuccess() {
      await expect(
         this.page.getByText("Event deleted successfully")
      ).toBeVisible({ timeout: 10000 })
   }
}
