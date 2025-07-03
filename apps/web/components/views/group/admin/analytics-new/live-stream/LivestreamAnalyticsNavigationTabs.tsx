import { Box } from "@mui/material"
import { BrandedTabs } from "components/views/common/BrandedTabs"
import { useRouter } from "next/router"
import { SyntheticEvent } from "react"
import { AtSign, Hexagon, MessageCircle, Users } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
   },
})

const tabs = [
   {
      label: "Overview",
      value: "/group/[groupId]/admin/analytics/live-streams/overview",
      catchAllPath: undefined,
      icon: <Hexagon />,
   },
   {
      label: "Live stream analytics",
      value: "/group/[groupId]/admin/analytics/live-streams",
      catchAllPath:
         "/group/[groupId]/admin/analytics/live-streams/[[...livestreamId]]",
      icon: <AtSign />,
   },
   {
      label: "Registration Source",
      value: "/group/[groupId]/admin/analytics/live-streams/registration-sources",
      catchAllPath: undefined,
      icon: <Users />,
   },
   {
      label: "Feedback",
      value: "/group/[groupId]/admin/analytics/live-streams/feedback/[[...feedback]]",
      catchAllPath: undefined,
      icon: <MessageCircle />,
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
                  icon={tab.icon}
               />
            ))}
         </BrandedTabs>
      </Box>
   )
}
