import { expect, Locator } from "@playwright/test"
import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class LivestreamsAdminPage extends CommonPage {
   // Locator constants
   public readonly statusFilterButton: Locator
   public readonly applyFilterButton: Locator
   public readonly searchField: Locator
   public readonly livestreamQuestionsDialog: Locator
   public readonly csvDownloadDialog: Locator
   public readonly promoteLivestreamDialog: Locator

   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)

      // Initialize locators
      this.statusFilterButton = this.page.getByRole("button", {
         name: "Status",
      })
      this.applyFilterButton = this.page.getByRole("button", { name: "Apply" })
      this.searchField = this.page.getByPlaceholder(
         "Search by title or company"
      )
      this.livestreamQuestionsDialog = this.page.getByTestId(
         "livestream-questions-dialog"
      )
      this.csvDownloadDialog = this.page.getByTestId("csv-download-dialog")
      this.promoteLivestreamDialog = this.page.getByTestId(
         "promote-livestream-dialog"
      )
   }

   // Status filter methods for the new table structure
   public async filterByStatus(
      status: "Published" | "Draft" | "Recorded" | "Recording not available"
   ) {
      // Click on the Status filter header to open the dropdown
      await this.statusFilterButton.click()

      // Select the specific status option
      await this.page.getByRole("menuitem", { name: status }).click()

      // Click Apply button
      await this.applyFilterButton.click()
   }

   public async clearStatusFilter() {
      // Click on the Status filter header to open the dropdown
      await this.statusFilterButton.click()

      // Uncheck all selected options
      const checkboxes = this.page.locator(
         '[role="menuitem"] .MuiCheckbox-root'
      )
      const count = await checkboxes.count()

      for (let i = 0; i < count; i++) {
         const checkbox = checkboxes.nth(i)
         if (await checkbox.isChecked()) {
            await checkbox.click()
         }
      }

      // Click Apply button
      await this.applyFilterButton.click()
   }

   // Method to click on a specific event by title (navigates to edit page)
   public async clickEventToEditByTitle(title: string) {
      // Find the table cell containing the specific title and click on it
      // Based on Playwright recorder: await page.getByRole('cell', { name: 'Event Title' }).click();
      const eventCell = this.page.getByRole("cell", { name: title })
      await eventCell.click()

      // Wait for navigation to the edit page eg: /group/123/admin/content/live-streams/123
      await this.page.waitForURL(/\/admin\/content\/live-streams\/[^/]+$/)
   }

   // Method to navigate back to the events list from the edit page
   public async goBackToEventsList() {
      // Based on Playwright recorder: await page.getByText('Live stream details').click();
      await this.page.getByText("Live stream details").click()
   }

   // Method to search for events
   public async searchEvents(searchTerm: string) {
      await this.searchField.fill(searchTerm)
   }

   // Method to verify event is visible in the table
   public async assertEventIsVisible(title: string) {
      // Use the same locator pattern as clickEventToEditByTitle for consistency
      const eventCell = this.page.getByRole("cell", { name: title })
      return expect(eventCell).toBeVisible()
   }

   // Method to verify event is not visible in the table
   public async assertEventIsNotVisible(title: string) {
      // Use the same locator pattern as clickEventToEditByTitle for consistency
      const eventCell = this.page.getByRole("cell", { name: title })
      return expect(eventCell).not.toBeVisible()
   }

   // Action button methods
   public async hoverOverEventRow(title: string) {
      const eventRow = this.page.getByRole("row").filter({
         hasText: title,
      })
      await eventRow.hover()
   }

   public async clickActionButton(
      action:
         | "edit"
         | "enter-livestream"
         | "share-livestream"
         | "share-recording"
         | "analytics"
         | "questions"
         | "feedback"
   ) {
      const testId = `hover-action-${action}`
      const actionButton = this.page.getByTestId(testId).first()
      await actionButton.click()
   }

   // Dialog interaction methods
   public async waitForQuestionsDialog() {
      await this.livestreamQuestionsDialog.waitFor({ state: "visible" })
   }

   public async closeQuestionsDialog() {
      const closeButton = this.livestreamQuestionsDialog
         .getByRole("button", { name: "Close" })
         .first()
      await closeButton.click()
   }

   public async downloadQuestions() {
      const downloadButton = this.livestreamQuestionsDialog.getByRole(
         "button",
         {
            name: /Download questions?/,
         }
      )

      await downloadButton.click()

      // Wait for the download confirmation dialog
      await this.csvDownloadDialog.waitFor({ state: "visible" })

      // Set up download event listener before clicking download
      const downloadPromise = this.page.waitForEvent("download")

      // Click the Download button in the confirmation dialog
      await this.csvDownloadDialog
         .getByRole("button", { name: "Download" })
         .click()

      // Wait for the download to start
      const download = await downloadPromise

      // Verify the download filename contains expected text
      expect(download.suggestedFilename()).toContain(".csv")
   }

   public async publish() {
      await this.parent.clickPublish()
   }

   // Promote livestream dialog helpers
   public async waitForPromoteDialog() {
      await this.promoteLivestreamDialog.waitFor({ state: "visible" })
   }

   public async closePromoteDialog() {
      const closeButton = this.promoteLivestreamDialog.getByTestId(
         "promote-livestream-dialog-close-button"
      )
      await closeButton.click()
   }

   public async assertPromoteDialogCopyLinkWorks() {
      const inputElement =
         this.promoteLivestreamDialog.getByLabel("Live stream link")

      const link = await inputElement.inputValue()

      expect(link).toMatch(
         /\/portal\/livestream\/([a-zA-Z0-9_-]+)\?utm_source=client&utm_campaign=events&utm_content=([a-zA-Z0-9_-]+)/
      )

      await this.promoteLivestreamDialog
         .getByRole("button", { name: "Copy" })
         .click()

      await expect(
         this.promoteLivestreamDialog.getByText("Link copied!")
      ).toBeVisible()
   }
}
