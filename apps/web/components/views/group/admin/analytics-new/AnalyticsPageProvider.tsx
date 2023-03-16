import { useGroup } from "layouts/GroupDashboardLayout"
import React, { createContext, FC, useContext, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { collectionGroup, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../data/firebase/FirebaseInstance"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"

type IAnalyticsPageContext = {
   /**
    * Loading status:
    *  undefined => still loading
    *  null => non existent
    */
   livestreamStats: LiveStreamStats[] | null | undefined
   fieldsOfStudyLookup: Record<string, string>
   setLivestreamStatsTimeFrame: React.Dispatch<React.SetStateAction<TimeFrame>>
   livestreamStatsTimeFrame: TimeFrame
}
const now = new Date()
export const TimeFrames = {
   "Last 30 days": {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: now,
   },
   "Last 6 months": {
      start: new Date(new Date().setDate(new Date().getDate() - 180)),
      end: now,
   },
   "Last 1 year": {
      start: new Date(new Date().setDate(new Date().getDate() - 365)),
      end: now,
   },
   "Last 2 years": {
      start: new Date(new Date().setDate(new Date().getDate() - 730)),
      end: now,
   },
   "All time": {
      start: new Date(0),
      end: now,
   },
} as const

export type TimeFrame = keyof typeof TimeFrames

const initialValues: IAnalyticsPageContext = {
   livestreamStats: undefined,
   fieldsOfStudyLookup: {},
   setLivestreamStatsTimeFrame: () => {},
   livestreamStatsTimeFrame: "Last 2 years",
}

const AnalyticsPageContext = createContext<IAnalyticsPageContext>(initialValues)

export const AnalyticsPageProvider: FC = ({ children }) => {
   const { group } = useGroup()

   const [livestreamStatsTimeFrame, setLivestreamStatsTimeFrame] =
      useState<TimeFrame>("Last 2 years")

   const livestreamStatsQuery = useMemo(() => {
      const timeFrame = TimeFrames[livestreamStatsTimeFrame]
      return query(
         collectionGroup(FirestoreInstance, "stats"),
         where("id", "==", "livestreamStats"),
         where("livestream.groupIds", "array-contains", group.id),
         where("livestream.start", ">=", timeFrame.start),
         where("livestream.start", "<=", timeFrame.end)
      )
   }, [group.id, livestreamStatsTimeFrame])

   const { data: livestreamStats } = useFirestoreCollection<LiveStreamStats>(
      livestreamStatsQuery,
      queryOptions
   )

   const { data: fieldsOfStudy } = useFirestoreCollection<FieldOfStudy>(
      "fieldsOfStudy",
      queryOptions
   )

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )

   const value = useMemo<IAnalyticsPageContext>(() => {
      return {
         fieldsOfStudyLookup,
         livestreamStats,
         setLivestreamStatsTimeFrame,
         livestreamStatsTimeFrame,
      }
   }, [fieldsOfStudyLookup, livestreamStats, livestreamStatsTimeFrame])

   return (
      <AnalyticsPageContext.Provider value={value}>
         {children}
      </AnalyticsPageContext.Provider>
   )
}

export const useAnalyticsPageContext = () => {
   const context = useContext(AnalyticsPageContext)
   if (context === undefined) {
      throw new Error(
         "useAnalyticsPageContext must be used within a AnalyticsPageContextProvider"
      )
   }
   return context
}

const queryOptions = {
   suspense: true,
   idField: "id",
} as const
