import { CompanyIndustryValues } from "@careerfairy/shared-lib/constants/forms"
import {
   SparkAnalyticsClient,
   TimePeriodParams,
} from "@careerfairy/shared-lib/sparks/analytics"
import { useFetchSparksAnalytics } from "components/custom-hook/spark/analytics/useFetchSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { timeFrameLabels } from "./util"

interface SparksAnalyticsContextType {
   filteredAnalytics: SparkAnalyticsClient | null
   isLoading: boolean
   isMutating: boolean
   error: string | null
   updateAnalytics: () => void
   selectTimeFilter: TimePeriodParams
   setSelectTimeFilter: (selectTimeFilter: TimePeriodParams) => void
   updatedAtLabel: string
   industriesOptions: { value: string; label: string }[]
   industriesOptionsTopCompanies: { value: string; label: string }[]
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

   const [updatedAtLabel, setUpdatedAtLabel] = useState<string>(null)

   const [selectTimeFilter, setSelectTimeFilter] =
      useState<TimePeriodParams>("30days")

   const { analytics, error, isLoading, updateAnalytics, isMutating } =
      useFetchSparksAnalytics(group.id)

   const filteredAnalytics = useMemo<SparkAnalyticsClient>(() => {
      return analytics?.[selectTimeFilter]
   }, [analytics, selectTimeFilter])

   const industriesOptions = useMemo(() => {
      if (!analytics) return []

      const timePeriods = Object.keys(timeFrameLabels)
      const topSparksIndustries = Array.from(
         new Set(
            timePeriods.flatMap((timePeriod) => {
               return Object.keys(analytics[timePeriod].topSparksByIndustry)
            })
         )
      )

      const allOptions = [
         {
            id: "all",
            name: "All Industries",
         },
         ...CompanyIndustryValues,
      ].map((industry) => ({
         value: industry.id,
         label: industry.name,
      }))

      const groupIndustriesById = group.companyIndustries.map(
         (industry) => industry.id
      )

      const result = allOptions.filter(
         (option) =>
            groupIndustriesById.includes(option.value) ||
            topSparksIndustries.includes(option.value)
      )

      return result
   }, [analytics, group?.companyIndustries])

   const industriesOptionsTopCompanies = useMemo(() => {
      if (!analytics) return []

      const timePeriods = Object.keys(timeFrameLabels)
      const topCompaniesIndustries = Array.from(
         new Set(
            timePeriods.flatMap((timePeriod) => {
               return Object.keys(analytics[timePeriod].topCompaniesByIndustry)
            })
         )
      )

      const allOptions = [
         {
            id: "all",
            name: "All Industries",
         },
         ...CompanyIndustryValues,
      ].map((industry) => ({
         value: industry.id,
         label: industry.name,
      }))

      const groupIndustriesById = group.companyIndustries
         .map((industry) => industry.id)
         .filter((id) => topCompaniesIndustries.includes(id))

      const result = allOptions.filter(
         (option) =>
            groupIndustriesById.includes(option.value) ||
            topCompaniesIndustries.includes(option.value)
      )

      return result
   }, [analytics, group?.companyIndustries])

   const value = useMemo(() => {
      return {
         filteredAnalytics,
         isLoading,
         isMutating,
         error,
         updateAnalytics,
         selectTimeFilter,
         setSelectTimeFilter,
         updatedAtLabel,
         industriesOptions,
         industriesOptionsTopCompanies,
      }
   }, [
      filteredAnalytics,
      isLoading,
      isMutating,
      error,
      updateAnalytics,
      selectTimeFilter,
      updatedAtLabel,
      industriesOptions,
      industriesOptionsTopCompanies,
   ])

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [analytics?.updatedAt?.getTime()])

   return (
      <SparksAnalyticsContext.Provider value={value}>
         {children}
      </SparksAnalyticsContext.Provider>
   )
}
