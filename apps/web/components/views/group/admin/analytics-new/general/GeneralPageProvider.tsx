import React, { createContext, FC, useContext, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"

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
}

const initialValues: IAnalyticsPageContext = {
   livestreamStats: undefined,
   fieldsOfStudyLookup: {},
   setLivestreamStats: () => {},
}

const AnalyticsPageContext = createContext<IAnalyticsPageContext>(initialValues)

export const GeneralPageProvider: FC = ({ children }) => {
   const [livestreamStats, setLivestreamStats] = useState<
      LiveStreamStats[] | undefined
   >(undefined)

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
      }
   }, [fieldsOfStudyLookup, livestreamStats, setLivestreamStats])

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
