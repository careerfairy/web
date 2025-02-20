import {
   GroupEventActionType,
   GroupEventClient,
} from "@careerfairy/shared-lib/groups/telemetry"
import { useAuth } from "HOCs/AuthProvider"
import useBatchedEvents from "components/custom-hook/utils/useBatchedEvents"
import { groupService } from "data/firebase/GroupService"
import { FC, createContext, useCallback, useContext, useMemo } from "react"
import CookiesUtil from "util/CookiesUtil"
import useFingerPrint from "../../components/custom-hook/useFingerPrint"

const BATCH_SIZE = 10 // Maximum number of events that can be batched
const BATCH_INTERVAL = 5000 // Interval for sending batched events (in ms)

type GroupEventTrackerProviderProps = {
   // TODO: Type interactionSource
   trackEvent: (
      groupId: string,
      event: GroupEventActionType,
      interactionSource?: string
   ) => void
}

const GroupEventTrackerContext = createContext<GroupEventTrackerProviderProps>({
   trackEvent: () => {},
})

export const FeaturedCompaniesTrackerProvider: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   const { userData } = useAuth()
   const { data: visitorId } = useFingerPrint()

   // TODO: check if needed
   const addEventToBatch = useBatchedEvents<GroupEventClient>(
      (data) => groupService.trackGroupEvents(data),
      BATCH_SIZE,
      BATCH_INTERVAL,
      "unsentGroupEvents"
   )

   const trackEvent = useCallback(
      (
         groupId: string,
         event: GroupEventActionType,
         interactionSource?: string
      ) => {
         // Get UTM parameters from cookies
         const utmParams = CookiesUtil.getUTMParams() || {}

         const {
            utm_source = null,
            utm_medium = null,
            utm_campaign = null,
            utm_term = null,
            utm_content = null,
         } = utmParams

         const options: GroupEventClient = {
            authId: userData?.authId || null,
            visitorId,
            stringTimestamp: new Date().toISOString(),
            groupId,
            actionType: event,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            utm_content,
            interactionSource,
         }

         addEventToBatch(options)
      },
      [addEventToBatch, userData?.authId, visitorId]
   )

   const value = useMemo(() => ({ trackEvent }), [trackEvent])

   return (
      <GroupEventTrackerContext.Provider value={value}>
         {children}
      </GroupEventTrackerContext.Provider>
   )
}

export const useFeaturedCompaniesTracker = () => {
   const context = useContext(GroupEventTrackerContext)
   if (context === undefined) {
      throw new Error(
         "useFeaturedCompaniesTracker must be used within a FeaturedCompaniesTrackerProvider"
      )
   }
   return context
}

export default FeaturedCompaniesTrackerProvider
