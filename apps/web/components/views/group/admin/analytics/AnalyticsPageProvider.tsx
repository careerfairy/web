import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useCollection, {
   CollectionResponse,
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "components/custom-hook/useCollection"
import { livestreamRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import { createContext, useContext, useMemo } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Identifiable } from "../../../../../types/commonTypes"
import { collection } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../data/firebase/FirebaseInstance"
import { useFirestoreCollectionData } from "reactfire"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
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
}

const initialValues: IAnalyticsPageContext = {
   nextLivestream: undefined,
   pastLivestream: undefined,
   nextDraft: undefined,
}

const AnalyticsPageContext = createContext<IAnalyticsPageContext>(initialValues)

export const AnalyticsPageProvider = ({ children }) => {
   const { group } = useGroup()

   const { data: fieldsOfStudy } = useFirestoreCollection<FieldOfStudy>(
      "fieldsOfStudy",
      undefined,
      {
         suspense: true,
         idField: "id",
      }
   )
   const { data: levelsOfStudy } = useFirestoreCollection<LevelOfStudy>(
      "levelsOfStudy",
      undefined,
      {
         suspense: true,
         idField: "id",
      }
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
         fieldsOfStudy,
         levelsOfStudy,
      }
   }, [fieldsOfStudyLookup, levelsOfStudyLookup, fieldsOfStudy, levelsOfStudy])

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
const timeFrames: TimeFrame[] = [
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
]
