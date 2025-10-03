import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { OfflineEventStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { useListenToDocument } from "components/custom-hook/useListenToDocument"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { createContext, useContext, useMemo } from "react"
import useClosestOfflineEventStats from "./useClosestOfflineEventStats"

type IOfflineEventAnalyticsPageContext = {
   currentEventStats: OfflineEventStats | undefined | null
   isLoadingCurrentEventStats: boolean
   fieldsOfStudyLookup: Record<string, string> | undefined | null
}

const initialValues: IOfflineEventAnalyticsPageContext = {
   currentEventStats: undefined,
   isLoadingCurrentEventStats: false,
   fieldsOfStudyLookup: {},
}

const OfflineEventAnalyticsPageContext =
   createContext<IOfflineEventAnalyticsPageContext>(initialValues)

export const OfflineEventAnalyticsPageProvider = ({ children }) => {
   const { group } = useGroup()
   const router = useRouter()
   // Since we are using a catch-all route, the offlineEventId will be the first element of the array
   const offlineEventId = router.query.offlineEventId?.[0] as string

   const isOnBasePage = !offlineEventId

   useClosestOfflineEventStats(group.id, {
      shouldFetch: isOnBasePage,
      refreshInterval: 3000,
   })

   const { data: currentEventStats, loading: isLoadingCurrentEventStats } =
      useListenToDocument<OfflineEventStats>(
         offlineEventId ? `offlineEventStats/${offlineEventId}` : null
      )

   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>("fieldsOfStudy")

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )

   const value = useMemo<IOfflineEventAnalyticsPageContext>(() => {
      return {
         currentEventStats, // Only return the current event stats if we are on a /offlineEventId page
         fieldsOfStudyLookup,
         isLoadingCurrentEventStats,
      }
   }, [currentEventStats, fieldsOfStudyLookup, isLoadingCurrentEventStats])

   return (
      <OfflineEventAnalyticsPageContext.Provider value={value}>
         {/*Only query the offline event stats if we are on a /offlineEventId page*/}
         {children}
      </OfflineEventAnalyticsPageContext.Provider>
   )
}

export const useOfflineEventAnalyticsPageContext = () => {
   const context = useContext(OfflineEventAnalyticsPageContext)
   if (context === undefined) {
      throw new Error(
         "useOfflineEventAnalyticsPageContext must be used within a OfflineEventAnalyticsPageProvider"
      )
   }
   return context
}
