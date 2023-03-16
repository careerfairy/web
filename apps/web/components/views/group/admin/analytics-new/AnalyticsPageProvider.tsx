import { useGroup } from "layouts/GroupDashboardLayout"
import React, { createContext, FC, useContext, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   collectionGroup,
   query,
   where,
   QueryConstraint,
} from "firebase/firestore"
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

export const TimeFrames = {
   "Last 30 days": {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: null, // null means we don't care about the end date
   },
   "Last 6 months": {
      start: new Date(new Date().setDate(new Date().getDate() - 180)),
      end: null,
   },
   "Last 1 year": {
      start: new Date(new Date().setDate(new Date().getDate() - 365)),
      end: null,
   },
   "Last 2 years": {
      start: new Date(new Date().setDate(new Date().getDate() - 730)),
      end: null,
   },
   "All time": {
      start: new Date(0),
      end: null,
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

      const constraints: QueryConstraint[] = [
         where("id", "==", "livestreamStats"),
         where("livestream.groupIds", "array-contains", group.id),
         where("livestream.start", ">=", timeFrame.start),
      ]

      if (timeFrame.end) {
         constraints.unshift(where("livestream.start", "<=", timeFrame.end))
      }

      return query(collectionGroup(FirestoreInstance, "stats"), ...constraints)
   }, [group.id, livestreamStatsTimeFrame])

   const { data: livestreamStats } = useFirestoreCollection<LiveStreamStats>(
      livestreamStatsQuery,
      queryOptions
   )
   console.log("-> livestreamStats", livestreamStats)

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
