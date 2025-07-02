import { Box } from "@mui/material"
import { BrandedTabs } from "components/views/common/BrandedTabs"
import { useRouter } from "next/router"
import { SyntheticEvent } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
   },
})

const tabs = [
   {
      label: "Live Streams",
      value: "/group/[groupId]/admin/analytics/live-stream",
      catchAllPath: undefined,
   },
   {
      label: "Live Stream Details",
      value: "/group/[groupId]/admin/analytics/live-stream/[[...livestreamId]]",
      catchAllPath: undefined,
   },
   {
      label: "Feedback",
      value: "/group/[groupId]/admin/analytics/live-stream/feedback/[[...feedback]]",
      catchAllPath: undefined,
   },
   {
      label: "Registration Sources",
      value: "/group/[groupId]/admin/analytics/registration-sources",
      catchAllPath: undefined,
   },
   {
      label: "Sparks",
      value: "/group/[groupId]/admin/analytics/sparks",
      catchAllPath: undefined,
   },
] as const

type TabValue = (typeof tabs)[number]["value"]

export const LivestreamAnalyticsNavigationTabs = () => {
   const { push, query, pathname } = useRouter()
   const groupId = query.groupId as string

   // Find active tab by matching the current pathname with tab values
   const getActiveTab = (): TabValue => {
      return tabs.find(
         (tab) =>
            tab.value === pathname ||
            (tab.catchAllPath && tab.catchAllPath === pathname)
      )?.value
   }

   const activeTab = getActiveTab()

   const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
      // Replace [groupId] with actual groupId in the pathname
      const actualPath = newValue.replace("[groupId]", groupId)
      push(actualPath)
   }

   return (
      <Box sx={styles.root}>
         <BrandedTabs activeValue={activeTab} onChange={handleTabChange}>
            {tabs.map((tab) => (
               <BrandedTabs.Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  href={tab.value.replace("[groupId]", groupId)}
               />
            ))}
         </BrandedTabs>
      </Box>
   )
}
