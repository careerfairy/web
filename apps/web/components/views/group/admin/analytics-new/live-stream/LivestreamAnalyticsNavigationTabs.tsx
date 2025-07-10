import { Box } from "@mui/material"
import { BrandedTabs } from "components/views/common/BrandedTabs"
import { useRouter } from "next/router"
import { SyntheticEvent } from "react"
import { AtSign, Hexagon, MessageCircle, Users } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      pt: 1.5,
      width: "100%",
   },
})

const tabs = [
   {
      label: "Overview",
      pathname: "/group/[groupId]/admin/analytics/live-streams/overview",
      icon: <Hexagon />,
   },
   {
      label: "Live stream analytics",
      pathname:
         "/group/[groupId]/admin/analytics/live-streams/[[...livestreamId]]",
      icon: <AtSign />,
   },
   {
      label: "Registration Source",
      pathname:
         "/group/[groupId]/admin/analytics/live-streams/registration-sources",
      icon: <Users />,
   },
   {
      label: "Feedback",
      pathname:
         "/group/[groupId]/admin/analytics/live-streams/feedback/[[...feedback]]",
      icon: <MessageCircle />,
   },
] as const

export const LivestreamAnalyticsNavigationTabs = () => {
   const { push, query, pathname } = useRouter()
   const groupId = query.groupId as string

   type TabValue = (typeof tabs)[number]["pathname"]

   // Find active tab by matching the current pathname with tab values
   const getActiveTab = (): TabValue => {
      return tabs.find((tab) => tab.pathname === pathname)?.pathname
   }

   const activeTab = getActiveTab()

   const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
      push({
         pathname: newValue,
         query: {
            groupId,
         },
      })
   }

   return (
      <Box sx={styles.root}>
         <BrandedTabs activeValue={activeTab} onChange={handleTabChange}>
            {tabs.map((tab) => (
               <BrandedTabs.Tab
                  key={tab.pathname}
                  label={tab.label}
                  value={tab.pathname}
                  href={{
                     pathname: tab.pathname,
                     query: {
                        groupId,
                     },
                  }}
                  icon={tab.icon}
                  shallow
               />
            ))}
         </BrandedTabs>
      </Box>
   )
}
