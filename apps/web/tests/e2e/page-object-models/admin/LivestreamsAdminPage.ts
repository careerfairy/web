import { expect } from "@playwright/test"
import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class LivestreamsAdminPage extends CommonPage {
   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)
   }

   // Status filter methods for the new table structure
   public async filterByStatus(
      status: "Published" | "Draft" | "Recorded" | "Recording not available"
   ) {
      // Click on the Status filter header to open the dropdown
      await this.page.getByRole("button", { name: "Status" }).click()

      // Select the specific status option
      await this.page.getByRole("menuitem", { name: status }).click()

      // Click Apply button
      await this.page.getByRole("button", { name: "Apply" }).click()
   }

   public async clearStatusFilter() {
      // Click on the Status filter header to open the dropdown
      await this.page.getByRole("button", { name: "Status" }).click()

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
      await this.page.getByRole("button", { name: "Apply" }).click()
   }

   // Legacy methods for backward compatibility (now use status filtering)
   public async clickDraftsTab() {
      await this.filterByStatus("Draft")
   }

   public async clickUpcomingTab() {
      await this.filterByStatus("Published")
   }

   // Method to click on a specific event by title (navigates to edit page)
   public async clickEventToEditByTitle(title: string) {
      // Find the table cell containing the specific title and click on it
      // Based on Playwright recorder: await page.getByRole('cell', { name: 'Event Title' }).click();
      const eventCell = this.page.getByRole("cell", { name: title })
      await eventCell.click()

      // Wait for navigation to the edit page
      await this.page.waitForURL(/\/admin\/content\/live-streams\/[^/]+$/)
   }

   // Method to navigate back to the events list from the edit page
   public async goBackToEventsList() {
      // Based on Playwright recorder: await page.getByText('Live stream details').click();
      await this.page.getByText("Live stream details").click()
   }

   // Method to search for events
   public async searchEvents(searchTerm: string) {
      const searchField = this.page.getByPlaceholder(
         "Search by title or company"
      )
      await searchField.fill(searchTerm)
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

   public async publish() {
      await this.parent.clickPublish()
   }
}
