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
   trackEvent: (
      groupId: string,
      event: GroupEventActionType,
      interactionSource?: string
   ) => void
}

const GroupEventTrackerContext = createContext<GroupEventTrackerProviderProps>({
   trackEvent: () => {},
})

export const CompaniesTrackerProvider: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   const { userData, isLoadingUserData } = useAuth()
   const { data: visitorId } = useFingerPrint()

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
         if (isLoadingUserData) {
            return
         }

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
      [addEventToBatch, userData?.authId, visitorId, isLoadingUserData]
   )

   const value = useMemo(() => ({ trackEvent }), [trackEvent])

   return (
      <GroupEventTrackerContext.Provider value={value}>
         {children}
      </GroupEventTrackerContext.Provider>
   )
}

export const useCompaniesTracker = () => {
   const context = useContext(GroupEventTrackerContext)
   if (context === undefined) {
      throw new Error(
         "useCompaniesTracker must be used within a CompaniesTrackerProvider"
      )
   }
   return context
}

export default CompaniesTrackerProvider
