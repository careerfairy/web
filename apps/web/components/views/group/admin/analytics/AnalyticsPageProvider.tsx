import { useGroup } from "layouts/GroupDashboardLayout"
import React, { createContext, useContext, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Identifiable } from "../../../../../types/commonTypes"
import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../data/firebase/FirebaseInstance"
import { ReactFireOptions } from "reactfire"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../custom-hook/utils/useFirestoreCollection"

type IAnalyticsPageContext = {
   /**
    * Loading status:
    *  undefined => still loading
    *  null => non existent
    */
   livestreamStats: LiveStreamStats[] | null | undefined
   fieldsOfStudyLookup: Record<string, string>

   levelsOfStudyLookup: Record<string, string>
   setLivestreamStatsTimeFrame: React.Dispatch<typeof timeFrames[number]>
}

const initialValues: IAnalyticsPageContext = {
   livestreamStats: undefined,
   fieldsOfStudyLookup: {},
   levelsOfStudyLookup: {},
   setLivestreamStatsTimeFrame: () => {},
}

const AnalyticsPageContext = createContext<IAnalyticsPageContext>(initialValues)

export const AnalyticsPageProvider = ({ children }) => {
   const { group } = useGroup()

   const [livestreamStatsTimeFrame, setLivestreamStatsTimeFrame] =
      useState<typeof timeFrames[number]>(defaultTimeFrame)

   const livestreamStatsQuery = useMemo(() => {
      return query(
         collection(FirestoreInstance, "livestreamStats"),
         where("livestream.groupIds", "array-contains", group.id),
         where("livestream.start", ">=", livestreamStatsTimeFrame.start),
         where("livestream.start", "<=", livestreamStatsTimeFrame.end)
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

   const { data: levelsOfStudy } = useFirestoreCollection<LevelOfStudy>(
      "levelsOfStudy",
      queryOptions
   )

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )
   const levelsOfStudyLookup = useMemo(
      () => createLookup(levelsOfStudy, "name"),
      [levelsOfStudy]
   )

   const value = useMemo<IAnalyticsPageContext>(() => {
      return {
         fieldsOfStudyLookup,
         levelsOfStudyLookup,
         livestreamStats,
         setLivestreamStatsTimeFrame,
      }
   }, [fieldsOfStudyLookup, levelsOfStudyLookup, livestreamStats])

   return (
      <AnalyticsPageContext.Provider value={value}>
         {children}
      </AnalyticsPageContext.Provider>
   )
}

const createLookup = <T extends Identifiable>(
   array: T[],
   propertyName: keyof T
): Record<string, T[keyof T]> => {
   return array.reduce((acc, curr) => {
      acc[curr.id] = curr[propertyName]
      return acc
   }, {})
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

type TimeFrame = {
   start: Date
   end: Date
   name: string
}

// Array of timeframes for the last month,6 months, 1 year, 2 years, all time
export const timeFrames = [
   {
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: new Date(),
      name: "Last 30 days",
   },
   {
      start: new Date(new Date().setDate(new Date().getDate() - 180)),
      end: new Date(),
      name: "Last 6 months",
   },
   {
      start: new Date(new Date().setDate(new Date().getDate() - 365)),
      end: new Date(),
      name: "Last 1 year",
   },
   {
      start: new Date(new Date().setDate(new Date().getDate() - 730)),
      end: new Date(),
      name: "Last 2 years",
   },
   {
      start: new Date(0),
      end: new Date(),
      name: "All time",
   },
] as const satisfies readonly TimeFrame[]

const queryOptions = {
   suspense: true,
   idField: "id",
} as const satisfies ReactFireOptions

const defaultTimeFrame = timeFrames.find((t) => t.name === "Last 2 years")
