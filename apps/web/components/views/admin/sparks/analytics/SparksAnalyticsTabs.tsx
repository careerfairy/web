import {
   BrandedTabs,
   BrandedTabsProps,
} from "components/views/common/BrandedTabs"
import { useRouter } from "next/router"
import { SyntheticEvent } from "react"
import { Flag, Hexagon, Users } from "react-feather"

const tabs = [
   { label: "Overview", value: "overview", icon: <Hexagon /> },
   { label: "Audience", value: "audience", icon: <Users /> },
   { label: "Competitor", value: "competitor", icon: <Flag /> },
] as const

export type TabValue = (typeof tabs)[number]["value"]

export const SparksAnalyticsTabs = (
   props: Omit<BrandedTabsProps, "activeValue" | "onChange">
) => {
   const { query, push, pathname } = useRouter()

   // Get tab value from query params, default to "overview"
   const tabValue = (query.tab as TabValue) || "overview"

   const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
      const cleanQuery = { ...query }
      cleanQuery.tab = newValue

      push(
         {
            pathname,
            query: cleanQuery,
         },
         undefined,
         { shallow: true }
      )
   }

   return (
      <BrandedTabs activeValue={tabValue} onChange={handleTabChange} {...props}>
         {tabs.map((tab) => (
            <BrandedTabs.Tab
               key={tab.value}
               label={tab.label}
               value={tab.value}
               icon={tab.icon}
            />
         ))}
      </BrandedTabs>
   )
}
