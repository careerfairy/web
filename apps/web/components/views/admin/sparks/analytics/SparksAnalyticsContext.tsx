import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import {
   SparkAnalyticsClient,
   SparkAnalyticsClientWithPastData,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { convertToClientModel } from "components/custom-hook/spark/analytics/dataTransformers"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { sparksAnalyticsService } from "data/firebase/SparksAnalyticsService"
import { useGroup } from "layouts/GroupDashboardLayout"
import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"

interface SparksAnalyticsContextType {
   filteredAnalytics: SparkAnalyticsClient | null
   isLoading: boolean
   error: string | null
   updateAnalytics: () => void
   selectTimeFilter: TimePeriodParams
   setSelectTimeFilter: (selectTimeFilter: TimePeriodParams) => void
}

const SparksAnalyticsContext = createContext<
   SparksAnalyticsContextType | undefined
>(undefined)

export const useSparksAnalytics = () => {
   const context = useContext(SparksAnalyticsContext)
   if (!context) {
      throw new Error(
         "useSparksAnalytics must be used within a SparksAnalyticsProvider"
      )
   }
   return context
}

export const SparksAnalyticsProvider = ({ children }) => {
   const { group } = useGroup()

   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>("fieldsOfStudy")
   const { data: levelsOfStudy } =
      useFirestoreCollection<LevelOfStudy>("levelsOfStudy")

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )
   const levelsOfStudyLookup = useMemo(
      () => createLookup(levelsOfStudy, "name"),
      [levelsOfStudy]
   )

   const [analytics, setAnalytics] = useState<
      SparkAnalyticsClientWithPastData | object | null
   >(null)
   const [isLoading, setIsLoading] = useState<boolean>(true)
   const [error, setError] = useState<string | null>(null)

   const [selectTimeFilter, setSelectTimeFilter] =
      useState<TimePeriodParams>("30days")

   const fetchAnalytics = useCallback(
      (updateCache: boolean) => {
         sparksAnalyticsService
            .fetchSparksAnalytics(group.id, updateCache)
            .then((fetchedAnalytics) => {
               const updatedAnalytics = convertToClientModel(
                  fetchedAnalytics,
                  fieldsOfStudyLookup,
                  levelsOfStudyLookup
               )
               setAnalytics(updatedAnalytics)
               setIsLoading(false)
            })
            .catch((error) => {
               setError(error.message)
               setIsLoading(false)
            })
      },
      [fieldsOfStudyLookup, group.id, levelsOfStudyLookup]
   )

   const updateAnalytics = useCallback(() => {
      setIsLoading(true)
      fetchAnalytics(true)
   }, [fetchAnalytics])

   const filteredAnalytics = useMemo<SparkAnalyticsClient>(() => {
      console.log(
         "🚀 ~ filteredAnalytics ~ analytics:",
         analytics?.[selectTimeFilter]
      )
      return analytics?.[selectTimeFilter]
   }, [analytics, selectTimeFilter])

   const value = useMemo(() => {
      return {
         filteredAnalytics,
         isLoading,
         error,
         updateAnalytics,
         selectTimeFilter,
         setSelectTimeFilter,
      }
   }, [filteredAnalytics, isLoading, error, updateAnalytics, selectTimeFilter])

   useEffect(() => {
      fetchAnalytics(false)
   }, [fetchAnalytics])

   return (
      <SparksAnalyticsContext.Provider value={value}>
         {children}
      </SparksAnalyticsContext.Provider>
   )
}
