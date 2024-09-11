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
   updatedAtLabel: string
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

   const [analytics, setAnalytics] =
      useState<SparkAnalyticsClientWithPastData>(null)
   const [updatedAtLabel, setUpdatedAtLabel] = useState<string>(null)
   const [isLoading, setIsLoading] = useState<boolean>(true)
   const [error, setError] = useState<string | null>(null)

   const [selectTimeFilter, setSelectTimeFilter] =
      useState<TimePeriodParams>("30days")

   const fetchAnalytics = useCallback(
      async (updateCache: boolean) => {
         try {
            const fetchedAnalytics =
               await sparksAnalyticsService.fetchSparksAnalytics(
                  group.id,
                  updateCache
               )

            const updatedAnalytics = convertToClientModel(
               fetchedAnalytics,
               fieldsOfStudyLookup,
               levelsOfStudyLookup
            )

            setAnalytics(updatedAnalytics)
            setIsLoading(false)
         } catch (error) {
            console.log(error)
            setError(error.message)
            setIsLoading(false)
         }
      },
      [fieldsOfStudyLookup, group.id, levelsOfStudyLookup]
   )

   const updateAnalytics = useCallback(() => {
      setIsLoading(true)
      fetchAnalytics(true)
   }, [fetchAnalytics])

   const filteredAnalytics = useMemo<SparkAnalyticsClient>(() => {
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
         updatedAtLabel,
      }
   }, [
      filteredAnalytics,
      isLoading,
      error,
      updateAnalytics,
      selectTimeFilter,
      updatedAtLabel,
   ])

   useEffect(() => {
      fetchAnalytics(false)
   }, [fetchAnalytics])

   useEffect(() => {
      const updateLabel = () => {
         if (!analytics?.updatedAt) return ""

         const now = Date.now()
         const diff = now - analytics.updatedAt.getTime()
         const seconds = Math.floor(diff / 1000)
         const minutes = Math.floor(seconds / 60)
         const hours = Math.floor(minutes / 60)
         const days = Math.floor(hours / 24)

         let label
         if (seconds < 60) {
            label = "now"
         } else if (minutes < 1) {
            label = `${seconds} ${seconds === 1 ? "second" : "seconds"}`
         } else if (hours < 1) {
            label = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
         } else if (days < 1) {
            label = `${hours} ${hours === 1 ? "hour" : "hours"}`
         } else if (days <= 28) {
            label = `${days} ${days === 1 ? "day" : "days"}`
         } else {
            label = `${analytics.updatedAt.toLocaleDateString()}`
         }

         setUpdatedAtLabel(label)
      }

      updateLabel()

      const interval = setInterval(updateLabel, 1000)
      return () => clearInterval(interval)
   }, [analytics?.updatedAt])

   return (
      <SparksAnalyticsContext.Provider value={value}>
         {children}
      </SparksAnalyticsContext.Provider>
   )
}
