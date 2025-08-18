import { InsightsClient } from "search-insights"
import { isTestEnvironment } from "util/CommonUtil"
import { AnalyticsEvents } from "util/analyticsConstants"
import { analyticsTrackEvent } from "util/analyticsUtils"

// Initialize insights client
let insightsClient: InsightsClient | null = null

/**
 * Initialize Algolia Insights client for event tracking
 * This enables Algolia Recommend by tracking user interactions
 */
export const initializeAlgoliaInsights = (): InsightsClient => {
   if (insightsClient) {
      return insightsClient
   }

   // Dynamic import to avoid SSR issues
   if (typeof window !== "undefined") {
      import("search-insights").then((insights) => {
         const client = insights.default

         client("init", {
            appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
            apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!,
            useCookie: true,
            cookieDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
         })

         insightsClient = client
      })
   }

   return insightsClient!
}

/**
 * Generate a unique user token for Algolia events
 * Uses existing user ID or generates anonymous token
 */
export const generateUserToken = (
   userId?: string,
   fingerPrintId?: string
): string => {
   if (userId) {
      return `user_${userId}`
   }

   if (fingerPrintId) {
      return `anonymous_${fingerPrintId}`
   }

   // For anonymous users, use a persistent token stored in localStorage
   if (typeof window !== "undefined") {
      let anonymousToken = localStorage.getItem("algolia_anonymous_token")
      if (!anonymousToken) {
         anonymousToken = `anonymous_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`
         localStorage.setItem("algolia_anonymous_token", anonymousToken)
      }
      return anonymousToken
   }

   return `anonymous_${Date.now()}`
}

/**
 * Algolia Events Service for tracking user interactions
 * Supports Algolia Recommend by sending click, view, and conversion events
 */
export class AlgoliaEventsService {
   private insights: InsightsClient

   constructor() {
      this.insights = initializeAlgoliaInsights()
   }

   /**
    * Track when a user clicks on a search result
    * This is essential for Algolia Recommend's Related Items model
    */
   trackSearchResultClick = async ({
      index,
      queryID,
      objectID,
      position,
      userToken,
      eventName = "Search Result Clicked",
   }: {
      index: string
      queryID: string
      objectID: string
      position: number
      userToken: string
      eventName?: string
   }) => {
      if (!this.insights || isTestEnvironment()) return

      try {
         // Send to Algolia
         this.insights("clickedObjectIDsAfterSearch", {
            index,
            eventName,
            queryID,
            objectIDs: [objectID],
            positions: [position],
            userToken,
         })

         // Also track in your existing analytics
         analyticsTrackEvent(AnalyticsEvents.AlgoliaSearchResultClick, {
            index,
            queryID,
            objectID,
            position,
            eventName,
         })
      } catch (error) {
         console.error("Failed to track Algolia search result click:", error)
      }
   }

   /**
    * Track when a user views a search result (impression)
    * Useful for understanding user engagement patterns
    */
   trackSearchResultView = async ({
      index,
      queryID,
      objectIDs,
      userToken,
      eventName = "Search Results Viewed",
   }: {
      index: string
      queryID: string
      objectIDs: string[]
      userToken: string
      eventName?: string
   }) => {
      if (!this.insights || isTestEnvironment()) return

      try {
         this.insights("viewedObjectIDs", {
            index,
            eventName,
            objectIDs,
            userToken,
         })

         analyticsTrackEvent(AnalyticsEvents.AlgoliaSearchResultsView, {
            index,
            queryID,
            objectIDs,
            eventName,
         })
      } catch (error) {
         console.error("Failed to track Algolia search result view:", error)
      }
   }

   /**
    * Track conversion events (e.g., registration, application, follow)
    * Critical for Algolia Recommend to understand successful outcomes
    */
   trackConversion = async ({
      index,
      queryID,
      objectIDs,
      userToken,
      eventName,
      value,
   }: {
      index: string
      queryID?: string
      objectIDs: string[]
      userToken: string
      eventName: string
      value?: number
   }) => {
      if (!this.insights || isTestEnvironment()) return

      try {
         if (queryID) {
            // Conversion after search
            this.insights("convertedObjectIDsAfterSearch", {
               index,
               eventName,
               queryID,
               objectIDs,
               userToken,
               ...(value && { value }),
            })
         } else {
            // Conversion without search
            this.insights("convertedObjectIDs", {
               index,
               eventName,
               objectIDs,
               userToken,
               ...(value && { value }),
            })
         }

         analyticsTrackEvent(AnalyticsEvents.AlgoliaConversion, {
            index,
            queryID,
            objectIDs,
            eventName,
            value,
         })
      } catch (error) {
         console.error("Failed to track Algolia conversion:", error)
      }
   }

   /**
    * Track when users interact with recommended items
    * This helps improve the recommendation models
    */
   trackRecommendationClick = async ({
      index,
      objectID,
      userToken,
      eventName = "Recommendation Clicked",
   }: {
      index: string
      objectID: string
      userToken: string
      eventName?: string
   }) => {
      if (!this.insights || isTestEnvironment()) return

      try {
         this.insights("clickedObjectIDs", {
            index,
            eventName,
            objectIDs: [objectID],
            userToken,
         })

         analyticsTrackEvent(AnalyticsEvents.AlgoliaRecommendationClick, {
            index,
            objectID,
            eventName,
         })
      } catch (error) {
         console.error("Failed to track Algolia recommendation click:", error)
      }
   }

   /**
    * Track when users view recommended items
    */
   trackRecommendationView = async ({
      index,
      objectIDs,
      userToken,
      eventName = "Recommendations Viewed",
   }: {
      index: string
      objectIDs: string[]
      userToken: string
      eventName?: string
   }) => {
      if (!this.insights || isTestEnvironment()) return

      try {
         this.insights("viewedObjectIDs", {
            index,
            eventName,
            objectIDs,
            userToken,
         })

         analyticsTrackEvent(AnalyticsEvents.AlgoliaRecommendationsView, {
            index,
            objectIDs,
            eventName,
         })
      } catch (error) {
         console.error("Failed to track Algolia recommendation view:", error)
      }
   }
}

// Singleton instance
export const algoliaEventsService = new AlgoliaEventsService()
