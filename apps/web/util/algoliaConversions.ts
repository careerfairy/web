import {
   algoliaEventsService,
   generateUserToken,
} from "data/algolia/AlgoliaEventsService"

/**
 * Utility functions for tracking Algolia conversion events
 * These help Algolia understand successful outcomes and improve recommendations
 */

/**
 * Track when a user registers for a livestream event
 */
export const trackLivestreamRegistration = async ({
   livestreamId,
   userId,
   queryID,
}: {
   livestreamId: string
   userId?: string
   queryID?: string
}) => {
   const userToken = generateUserToken(userId)

   await algoliaEventsService.trackConversion({
      index: "livestreams",
      queryID,
      objectIDs: [livestreamId],
      userToken,
      eventName: "Livestream Registration",
      value: 1, // You can assign different values based on business importance
   })
}

/**
 * Track when a user follows/saves a company
 */
export const trackCompanyFollow = async ({
   companyId,
   userId,
   queryID,
}: {
   companyId: string
   userId?: string
   queryID?: string
}) => {
   const userToken = generateUserToken(userId)

   await algoliaEventsService.trackConversion({
      index: "companies",
      queryID,
      objectIDs: [companyId],
      userToken,
      eventName: "Company Follow",
      value: 2,
   })
}

/**
 * Track when a user applies to a job
 */
export const trackJobApplication = async ({
   jobId,
   userId,
   queryID,
}: {
   jobId: string
   userId?: string
   queryID?: string
}) => {
   const userToken = generateUserToken(userId)

   await algoliaEventsService.trackConversion({
      index: "customJobs",
      queryID,
      objectIDs: [jobId],
      userToken,
      eventName: "Job Application",
      value: 5, // Higher value as this is a key conversion
   })
}

/**
 * Track when a user engages with a spark (like, share, etc.)
 */
export const trackSparkEngagement = async ({
   sparkId,
   userId,
   queryID,
   engagementType,
}: {
   sparkId: string
   userId?: string
   queryID?: string
   engagementType: "like" | "share" | "view_complete"
}) => {
   const userToken = generateUserToken(userId)
   const eventValues = {
      like: 1,
      share: 2,
      view_complete: 3,
   }

   await algoliaEventsService.trackConversion({
      index: "sparks",
      queryID,
      objectIDs: [sparkId],
      userToken,
      eventName: `Spark ${
         engagementType.charAt(0).toUpperCase() + engagementType.slice(1)
      }`,
      value: eventValues[engagementType],
   })
}

/**
 * Track when a user clicks on a LinkedIn profile from search results
 */
export const trackLinkedInClick = async ({
   objectId,
   index,
   userId,
   queryID,
}: {
   objectId: string
   index: string
   userId?: string
   queryID?: string
}) => {
   const userToken = generateUserToken(userId)

   await algoliaEventsService.trackConversion({
      index,
      queryID,
      objectIDs: [objectId],
      userToken,
      eventName: "LinkedIn Profile Click",
      value: 1,
   })
}

/**
 * Track high-value user actions that indicate strong engagement
 */
export const trackHighValueAction = async ({
   objectId,
   index,
   userId,
   queryID,
   actionType,
}: {
   objectId: string
   index: string
   userId?: string
   queryID?: string
   actionType: "bookmark" | "share" | "contact" | "visit_company_page"
}) => {
   const userToken = generateUserToken(userId)
   const eventValues = {
      bookmark: 2,
      share: 3,
      contact: 4,
      visit_company_page: 2,
   }

   await algoliaEventsService.trackConversion({
      index,
      queryID,
      objectIDs: [objectId],
      userToken,
      eventName: `High Value Action: ${actionType}`,
      value: eventValues[actionType],
   })
}
