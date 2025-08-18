import { useAuth } from "HOCs/AuthProvider"
import useFingerPrint from "components/custom-hook/useFingerPrint"
import {
   algoliaEventsService,
   generateUserToken,
} from "data/algolia/AlgoliaEventsService"
import { useCallback } from "react"

/**
 * Custom hook for tracking Algolia events with user context
 * Automatically handles user tokens and integrates with existing auth
 */
export const useAlgoliaEvents = () => {
   const { data: fingerPrintId } = useFingerPrint()
   const { userData } = useAuth()

   // Generate user token based on authentication state
   const userToken = generateUserToken(userData?.id, fingerPrintId)

   const trackSearchResultClick = useCallback(
      ({
         index,
         queryID,
         objectID,
         position,
         eventName,
      }: {
         index: string
         queryID: string
         objectID: string
         position: number
         eventName?: string
      }) => {
         algoliaEventsService.trackSearchResultClick({
            index,
            queryID,
            objectID,
            position,
            userToken,
            eventName,
         })
      },
      [userToken]
   )

   const trackSearchResultView = useCallback(
      ({
         index,
         queryID,
         objectIDs,
         eventName,
      }: {
         index: string
         queryID: string
         objectIDs: string[]
         eventName?: string
      }) => {
         algoliaEventsService.trackSearchResultView({
            index,
            queryID,
            objectIDs,
            userToken,
            eventName,
         })
      },
      [userToken]
   )

   const trackConversion = useCallback(
      ({
         index,
         queryID,
         objectIDs,
         eventName,
         value,
      }: {
         index: string
         queryID?: string
         objectIDs: string[]
         eventName: string
         value?: number
      }) => {
         algoliaEventsService.trackConversion({
            index,
            queryID,
            objectIDs,
            userToken,
            eventName,
            value,
         })
      },
      [userToken]
   )

   const trackRecommendationClick = useCallback(
      ({
         index,
         objectID,
         eventName,
      }: {
         index: string
         objectID: string
         eventName?: string
      }) => {
         algoliaEventsService.trackRecommendationClick({
            index,
            objectID,
            userToken,
            eventName,
         })
      },
      [userToken]
   )

   const trackRecommendationView = useCallback(
      ({
         index,
         objectIDs,
         eventName,
      }: {
         index: string
         objectIDs: string[]
         eventName?: string
      }) => {
         algoliaEventsService.trackRecommendationView({
            index,
            objectIDs,
            userToken,
            eventName,
         })
      },
      [userToken]
   )

   return {
      userToken,
      trackSearchResultClick,
      trackSearchResultView,
      trackConversion,
      trackRecommendationClick,
      trackRecommendationView,
   }
}
