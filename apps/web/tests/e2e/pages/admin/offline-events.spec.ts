import { expect } from "@playwright/test"
import { imageLogoPath } from "tests/constants"
import { groupAdminFixture as test } from "../../fixtures"

// Create test fixtures for different offline event statuses
const testWithFirstTimerStatus = test.extend({
   options: async ({ options }, use) => {
      await use({
         ...options,
         createUser: true,
         offlineEventStatus: "first-timer",
         completedGroup: true,
      })
   },
})

const testWithOutOfEventsStatus = test.extend({
   options: async ({ options }, use) => {
      await use({
         ...options,
         createUser: true,
         offlineEventStatus: "out-of-events",
         completedGroup: true,
      })
   },
})

const testWithAvailableEventsStatus = test.extend({
   options: async ({ options }, use) => {
      await use({
         ...options,
         createUser: true,
         offlineEventStatus: "has-available-events",
         completedGroup: true,
      })
   },
})

test.describe("Group Admin Offline Events", () => {
   // Only run those tests on chromium
   test.skip(({ browserName }) => browserName !== "chromium")

   test.describe("First-time groups (no offline events purchased)", () => {
      /**
       * Test for groups without purchased offline events.
       * These groups should see the promotion page instead of the events list.
       * When clicking "Start promoting now", the Stripe checkout dialog should appear.
       */
      testWithFirstTimerStatus(
         "Show promotion page and open Stripe checkout",
         async ({ groupPage }) => {
            // Navigate to offline events page
            const offlineEventsPage = await groupPage.goToOfflineEvents()

            // Assert promotion view is visible
            await offlineEventsPage.assertPromotionViewIsVisible()

            // Click "Start promoting now" button
            await offlineEventsPage.clickStartPromotingNow()

            // Wait for checkout dialog to appear
            await offlineEventsPage.waitForCheckoutDialog()

            // Wait for Stripe checkout to load within the embedded-checkout iframe
            await offlineEventsPage.waitForStripeCheckout()
         }
      )
   })

   test.describe("Groups with no available credits (out-of-events)", () => {
      /**
       * Test for groups with no credits trying to create an event from QuickActions.
       * Clicking "Publish an offline event" should show the out of events dialog.
       */
      testWithOutOfEventsStatus(
         "Show out of events dialog when creating from QuickActions",
         async ({ groupPage }) => {
            // Click "Publish an offline event" button from QuickActions
            const offlineEventsPage =
               await groupPage.clickQuickActionsOfflineEvent()

            // Wait for redirect and out of events dialog to appear
            await offlineEventsPage.waitForOutOfEventsDialog()

            // Click "Promote more offline events" button in the dialog
            await offlineEventsPage.clickPromoteMoreEventsInDialog()

            // Wait for checkout dialog to appear
            await offlineEventsPage.waitForCheckoutDialog()

            // Wait for Stripe checkout to load
            await offlineEventsPage.waitForStripeCheckout()
         }
      )

      /**
       * Test for groups with no credits trying to create an event from CreateMenu.
       * Clicking "Offline event" in the menu should show the out of events dialog.
       */
      testWithOutOfEventsStatus(
         "Show out of events dialog when creating from CreateMenu",
         async ({ groupPage }) => {
            // Click the create menu and select "Offline event"
            const offlineEventsPage =
               await groupPage.clickCreateMenuOfflineEvent()

            // Wait for redirect and out of events dialog to appear
            await offlineEventsPage.waitForOutOfEventsDialog()

            // Click "Promote more offline events" button in the dialog
            await offlineEventsPage.clickPromoteMoreEventsInDialog()

            // Wait for checkout dialog to appear
            await offlineEventsPage.waitForCheckoutDialog(true)

            // Wait for Stripe checkout to load
            await offlineEventsPage.waitForStripeCheckout()
         }
      )

      /**
       * Test for groups that have purchased credits before but have none left.
       * The table should be shown (even if empty) and "Promote more events" button
       * should open the checkout dialog.
       */
      testWithOutOfEventsStatus(
         "Show table and promote button",
         async ({ groupPage }) => {
            // Navigate to offline events page
            const offlineEventsPage = await groupPage.goToOfflineEvents()

            // Assert available events count is 0
            await offlineEventsPage.assertAvailableEventsCount(0)

            // Click "Promote more events" button in the header
            await offlineEventsPage.clickPromoteMoreEventsButton()

            // Wait for checkout dialog to appear
            await offlineEventsPage.waitForCheckoutDialog()

            // Wait for Stripe checkout to load
            await offlineEventsPage.waitForStripeCheckout()
         }
      )
   })

   test.describe("Groups with available credits (has-available-events)", () => {
      /**
       * Test that the correct count of available offline events is shown above the table.
       */
      testWithAvailableEventsStatus(
         "Show correct offline events count above table",
         async ({ groupPage }) => {
            const availableCount = 5

            // Navigate to offline events page
            const offlineEventsPage = await groupPage.goToOfflineEvents()

            // Assert table view is visible
            await expect(offlineEventsPage.searchField).toBeVisible()

            // Assert the correct count is displayed above the table
            await offlineEventsPage.assertAvailableEventsCount(availableCount)
         }
      )

      /**
       * Test creating a draft offline event.
       */
      testWithAvailableEventsStatus(
         "Create a draft offline event",
         async ({ groupPage }) => {
            const eventTitle = "Test Offline Event " + Date.now()

            // Navigate to offline events page
            const offlineEventsPage = await groupPage.goToOfflineEvents()

            // Assert table view is visible
            await expect(offlineEventsPage.searchField).toBeVisible()

            // Click create new offline event button
            await offlineEventsPage.clickCreateOfflineEventButton()

            // Wait for navigation to edit page
            await offlineEventsPage.page.waitForURL(
               /\/admin\/content\/offline-events\/.+$/
            )

            // Fill in minimal form data for draft (form auto-saves)
            await offlineEventsPage.fillOfflineEventForm({
               title: eventTitle,
            })

            // Wait for auto-save to complete
            await expect(
               offlineEventsPage.page.getByText("Saved")
            ).toBeVisible()

            // Navigate back to offline events list
            await offlineEventsPage.goBackToEventsList()
         }
      )

      /**
       * Test publishing an offline event.
       */
      testWithAvailableEventsStatus(
         "Publish a draft offline event",
         async ({ groupPage }) => {
            const eventTitle = "Test Published Event " + Date.now()

            // Navigate to offline events page
            const offlineEventsPage = await groupPage.goToOfflineEvents()

            // Assert table view is visible
            await expect(offlineEventsPage.searchField).toBeVisible()

            // Create a draft event first
            await offlineEventsPage.clickCreateOfflineEventButton()

            // Wait for navigation to edit page
            await offlineEventsPage.page.waitForURL(
               /\/admin\/content\/offline-events\/.+$/
            )

            // Fill in all required fields
            await offlineEventsPage.fillOfflineEventForm({
               title: eventTitle,
               description:
                  "This is a test offline event description with enough characters to meet the minimum requirement of 50 characters.",
               address: "Lisboa",
               registrationUrl: "https://example.com/register",
            })

            // Upload banner image
            await offlineEventsPage.uploadBannerImage(imageLogoPath)

            // Fill start date
            await offlineEventsPage.fillStartDate()

            // Wait for auto-save
            await expect(
               offlineEventsPage.page.getByText("Saved")
            ).toBeVisible()

            // Publish the event
            await offlineEventsPage.clickPublishButton()
            await offlineEventsPage.confirmPublish()

            // Wait for publish success and redirect
            await offlineEventsPage.waitForPublishSuccess()

            // Wait for navigation back to list
            await offlineEventsPage.page.waitForURL(
               /\/admin\/content\/offline-events$/
            )

            // Filter by Published status
            await offlineEventsPage.filterByStatus("Upcoming")

            // Verify event is visible in published list
            await offlineEventsPage.assertEventIsVisible(eventTitle)
         }
      )
   })
})
