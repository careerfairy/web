import React, { useEffect } from "react"
import { Grid, Typography } from "@mui/material"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import { useAuth } from "../../../../HOCs/AuthProvider"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import useUserJobApplications from "../../../custom-hook/useUserJobApplications"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import {
   JobApplicationCard,
   JobApplicationCardSkeleton,
} from "./JobApplicationCard"
import Stack from "@mui/material/Stack"
import { atsServiceInstance } from "../../../../data/firebase/ATSService"
import Tabs from "@mui/material/Tabs"
import { TabPanel } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import { alpha, useTheme } from "@mui/material/styles"
import { useRouter } from "next/router"
import Tab from "@mui/material/Tab"
import Link from "../../common/Link"
import { sxStyles } from "../../../../types/commonTypes"
import { JobStatus } from "@careerfairy/shared-lib/dist/ats/merge/MergeResponseTypes"
import Box from "@mui/material/Box"
import Image from "next/image"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { errorLogAndNotify } from "../../../../util/CommonUtil"

const styles = sxStyles({
   tabs: {
      "& .MuiTabs-flexContainer": {
         borderBottom: "2px solid",
         borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
         boxSizing: "border-box",
      },
   },
   tab: { px: 0, mr: 2, fontSize: "1.2rem" },
   tabLabel: {
      fontWeight: 600,
   },
})
type ApplicationsProps = {
   types?: JobStatus[]
}
const Applications = ({ types }: ApplicationsProps) => {
   const { userData } = useAuth()
   const { data } = useUserJobApplications(userData.id, types)

   if (data.length === 0) {
      return (
         <Stack sx={{ mt: 3 }} spacing={3}>
            <Box sx={{ textAlign: "center" }}>
               <Image
                  src="/illustrations/empty.svg"
                  width="600"
                  height="200"
                  alt="Empty search illustration"
               />
            </Box>
            <Typography
               sx={{ color: "text.secondary", textAlign: "center" }}
               variant="h6"
            >
               {"You have no applications."}
            </Typography>
         </Stack>
      )
   }
   return (
      <Stack spacing={2}>
         {data.map((application) => (
            <JobApplicationCard
               key={application.id}
               jobApplication={application}
            />
         ))}
      </Stack>
   )
}
const viewData = {
   "/profile/jobs?type=open": {
      component: <Applications types={["OPEN", "PENDING"]} />,
      title: {
         compact: "Open",
         full: "Open Applications",
      },
      value: 0,
   },
   "/profile/jobs?type=closed": {
      component: <Applications types={["CLOSED"]} />,
      title: {
         compact: "Closed",
         full: "Closed Applications",
      },
      value: 1,
   },
}
type Value = keyof typeof viewData
const Jobs = () => {
   const mobile = useIsMobile()
   const theme = useTheme()
   const { asPath } = useRouter()
   const value: Value = viewData[asPath]
      ? (asPath as Value)
      : "/profile/jobs?type=open"

   useEffect(() => {
      atsServiceInstance.updateUserJobApplications().catch((e) =>
         errorLogAndNotify(e, {
            description: "Failed to update your job applications",
         })
      )
   }, [])

   const views = Object.keys(viewData).map((path) => (
      <TabPanel
         dir={theme.direction}
         key={path}
         value={path}
         activeValue={value}
      >
         <SuspenseWithBoundary
            fallback={
               <Stack spacing={2}>
                  <JobApplicationCardSkeleton />
                  <JobApplicationCardSkeleton />
               </Stack>
            }
         >
            {viewData[path].component}
         </SuspenseWithBoundary>
      </TabPanel>
   ))

   const tabsArray = Object.keys(viewData).map((path, index) => (
      <Tab
         component={Link}
         wrapped
         key={`tab-${index}`}
         shallow
         sx={styles.tab}
         href={path}
         value={path}
         label={
            <Typography sx={styles.tabLabel} variant="h6">
               {mobile
                  ? viewData[path].title.compact
                  : viewData[path].title.full}
            </Typography>
         }
      />
   ))
   return (
      <ContentCard>
         <Grid container spacing={2}>
            <Grid item xs={12}>
               <ContentCardTitle>My Jobs</ContentCardTitle>
            </Grid>

            <Grid item xs={12}>
               <Typography>
                  During a live stream event you can apply to job openings and
                  they will appear here.
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <Tabs
                  value={value}
                  sx={styles.tabs}
                  indicatorColor="secondary"
                  textColor="secondary"
                  selectionFollowsFocus
                  allowScrollButtonsMobile
               >
                  {tabsArray}
               </Tabs>
            </Grid>

            <Grid item xs={12}>
               {views}
            </Grid>
         </Grid>
      </ContentCard>
   )
}

export default Jobs
