import React, { createContext, FC, useContext, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { DateTime } from "luxon"

type IAnalyticsPageContext = {
   /**
    * Loading status:
    *  undefined => still loading
    */
   livestreamStats: LiveStreamStats[] | undefined
   fieldsOfStudyLookup: Record<string, string>
   setLivestreamStats: React.Dispatch<
      React.SetStateAction<LiveStreamStats[] | undefined>
   >

   livestreamStatsTimeFrame: TimeFrame
   setLivestreamStatsTimeFrame: React.Dispatch<React.SetStateAction<TimeFrame>>
}

const initialValues: IAnalyticsPageContext = {
   livestreamStats: undefined,
   fieldsOfStudyLookup: {},
   setLivestreamStats: () => {},
   livestreamStatsTimeFrame: "Last 2 years",
   setLivestreamStatsTimeFrame: () => {},
}

const AnalyticsPageContext = createContext<IAnalyticsPageContext>(initialValues)

export const GeneralPageProvider: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   const [livestreamStats, setLivestreamStats] = useState<
      LiveStreamStats[] | undefined
   >(undefined)

   const [livestreamStatsTimeFrame, setLivestreamStatsTimeFrame] =
      useState<TimeFrame>("Last 2 years")

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
         setLivestreamStats,
         livestreamStatsTimeFrame,
         setLivestreamStatsTimeFrame,
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
   idField: "id",
   suspense: false,
}

export const TimeFrames = {
   "Last 30 days": {
      start: DateTime.local().minus({ days: 30 }).toJSDate(),
      end: null, // null means we don't care about the end date
   },
   "Last 6 months": {
      start: DateTime.local().minus({ months: 6 }).toJSDate(),
      end: null,
   },
   "Last 1 year": {
      start: DateTime.local().minus({ years: 1 }).toJSDate(),
      end: null,
   },
   "Last 2 years": {
      start: DateTime.local().minus({ years: 2 }).toJSDate(),
      end: null,
   },
   "All time": {
      start: new Date(0),
      end: null,
   },
} as const

export type TimeFrame = keyof typeof TimeFrames
