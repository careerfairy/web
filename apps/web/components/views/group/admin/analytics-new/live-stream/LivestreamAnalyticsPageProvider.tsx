import React, {
   createContext,
   Dispatch,
   SetStateAction,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { useRouter } from "next/router"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import useClosestLivestreamStats from "./useClosestLivestreamStats"
import useGroupLivestreamStat from "../../../../../custom-hook/live-stream/useGroupLivestreamStat"

export const userTypes = [
   { value: "registrations", label: "Registrations" },
   { value: "participants", label: "Participants" },
] as const

export type LivestreamUserType = typeof userTypes[number]["value"]

/**
 * Loading status:
 *  undefined => still loading
 *  null => no data
 */
type CurrentStreamStats = LiveStreamStats | undefined | null

type ILivestreamAnalyticsPageContext = {
   currentStreamStats: CurrentStreamStats

   userType: LivestreamUserType
   setUserType: Dispatch<SetStateAction<LivestreamUserType>>
   fieldsOfStudyLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
   setCurrentStreamStats: Dispatch<
      SetStateAction<ILivestreamAnalyticsPageContext["currentStreamStats"]>
   >
}

const initialUserType: ILivestreamAnalyticsPageContext["userType"] =
   "registrations"

const initialValues: ILivestreamAnalyticsPageContext = {
   currentStreamStats: undefined,
   userType: initialUserType,
   fieldsOfStudyLookup: {},
   levelsOfStudyLookup: {},
   setCurrentStreamStats: () => {},
   setUserType: () => {},
}

const LivestreamAnalyticsPageContext =
   createContext<ILivestreamAnalyticsPageContext>(initialValues)

export const LivestreamAnalyticsPageProvider = ({ children }) => {
   const { group } = useGroup()
   const router = useRouter()
   // Since we are using a catch-all route, the livestreamId will be the first element of the array
   const livestreamId = router.query.livestreamId?.[0] as string

   const isOnBasePage = !livestreamId

   const [currentStreamStats, setCurrentStreamStats] =
      useState<CurrentStreamStats>(undefined)

   const [userType, setUserType] = useState<LivestreamUserType>(initialUserType)

   const { isLoading: isClosestStreamLoading, closestLivestreamId } =
      useClosestLivestreamStats(group.id, isOnBasePage)

   const { data: fieldsOfStudy } = useFirestoreCollection<FieldOfStudy>(
      "fieldsOfStudy",
      queryOptions
   )
   const { data: levelsOfStudy } = useFirestoreCollection<LevelOfStudy>(
      "levelsOfStudy",
      queryOptions
   )

   const levelsOfStudyLookup = useMemo(
      () => createLookup(levelsOfStudy, "name"),
      [levelsOfStudy]
   )

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )

   const stats = useMemo<CurrentStreamStats>(() => {
      if (isOnBasePage) {
         // If we are on the base page, we want to show the closest livestream stats

         // If we are still loading the closest livestream stats,
         // we want to return undefined so that the loading state is shown
         if (isClosestStreamLoading) {
            return undefined
         }

         // If we have no closest livestreamId, we want to return null
         if (!closestLivestreamId) {
            return null
         }
      } else {
         // If we are on a /livestreamId page, we want to show the stats for that livestream
         return currentStreamStats
      }
   }, [
      closestLivestreamId,
      currentStreamStats,
      isClosestStreamLoading,
      isOnBasePage,
   ])

   const value = useMemo<ILivestreamAnalyticsPageContext>(() => {
      return {
         fieldsOfStudyLookup,
         levelsOfStudyLookup,
         currentStreamStats: stats, // Only return the current stream stats if we are on a /livestreamId page
         userType,
         setCurrentStreamStats,
         setUserType,
      }
   }, [fieldsOfStudyLookup, levelsOfStudyLookup, stats, userType])

   return (
      <LivestreamAnalyticsPageContext.Provider value={value}>
         {/*Only query the livestream stats if we are on a /livestreamId page*/}
         {livestreamId ? (
            <QueryLivestreamStats livestreamId={livestreamId} />
         ) : null}
         {children}
      </LivestreamAnalyticsPageContext.Provider>
   )
}

export const useLivestreamsAnalyticsPageContext = () => {
   const context = useContext(LivestreamAnalyticsPageContext)
   if (context === undefined) {
      throw new Error(
         "useLivestreamsAnalyticsPageContext must be used within a LivestreamAnalyticsPageContextProvider"
      )
   }
   return context
}

const QueryLivestreamStats = ({ livestreamId }: { livestreamId: string }) => {
   const { setCurrentStreamStats } = useLivestreamsAnalyticsPageContext()
   const { group } = useGroup()

   /**
    * We only want to fetch the livestream stats in the livestream analytics page and
    *
    * */
   const { status, data: stats } = useGroupLivestreamStat(
      group.id,
      livestreamId
   )

   const isLoaded = status === "success"

   useEffect(() => {
      // If there are no stats or the query is still loading, we don't want to set the current stream stats
      if (!isLoaded) {
         setCurrentStreamStats(undefined)
         return
      }

      // We only want the first result
      setCurrentStreamStats(stats?.[0] || null)

      return () => {
         setCurrentStreamStats(undefined)
      }
   }, [isLoaded, setCurrentStreamStats, stats])

   return null
}

const queryOptions = {
   idField: "id",
   suspense: false,
}
