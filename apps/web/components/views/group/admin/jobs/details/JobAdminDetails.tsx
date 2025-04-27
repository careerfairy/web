import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import { Box, Tab, Tabs, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useRouter } from "next/router"
import React, { FC, useCallback, useMemo, useState } from "react"
import { AlertCircle } from "react-feather"
import SwipeableViews from "react-swipeable-views"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { SwipeablePanel } from "../../../../../../materialUI/GlobalPanels/GlobalPanels"
import { sxStyles } from "../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import { SkeletonStackMultiple } from "../../../../../util/Skeletons"
import Link from "../../../../common/Link"
import JobApplicants from "./jobApplicants"
import NoApplicantsData from "./jobApplicants/NoApplicantsData"
import JobPosting from "./jobPosting"
import LinkedContent from "./linkedContent"

const styles = sxStyles({
   wrapper: {
      mx: { xs: 2, md: 5 },
      my: 2,
   },
   backButton: {
      display: "flex",
      alignItems: "center",
      height: "36px",
      fontSize: { md: "24px" },
      fontWeight: "600",
      color: "black !important",
   },
   indicator: {
      backgroundColor: (theme) => `${theme.palette.secondary.main} !important`,
   },
   jobWarningIndicator: {
      backgroundColor: (theme) => `${theme.palette.warning["600"]} !important`,
   },
   tabsLabel: {
      fontSize: "16px",
      lineHeight: "27px",
      fontWeight: "400",
      textTransform: "none",
   },
   activeTab: {
      fontWeight: "600",
   },
   applicantsTab: {
      display: "flex",
      alignItems: "center",

      "& svg": {
         width: 20,
         height: 20,
      },
   },
   tooltip: {
      ml: 1,
      color: (theme) => theme.brand.black[700],
   },
   tabs: {
      borderBottom: (theme) => `1px solid ${theme.palette.neutral[100]}`,
      "& .MuiTabs-scrollButtons": {
         width: "auto !important",
      },
   },
   warningTab: {
      fontWeight: "600",
      color: (theme) => theme.palette.warning["600"],
   },
   warningAlert: {
      ml: 1,
      color: (theme) => theme.palette.warning["600"],
   },
   centered: {
      display: "flex",
      justifyContent: "center",
      mt: 4,
   },
})

type Props = {
   job: CustomJob
}

const TabsEnum = {
   APPLICATION: 0,
   LINKED_CONTENT: 1,
   JOB_POSTING: 2,
}

const JobAdminDetails: FC<Props> = ({ job }) => {
   const [activeTabIndex, setActiveTabIndex] = useState(0)
   const { group } = useGroup()
   const { push } = useRouter()
   const { jobHubV1 } = useFeatureFlags()

   const allowToDisplayApplicantsData = group.privacyPolicyActive

   const switchTabHandler = useCallback(
      (_: React.SyntheticEvent, newTabIndex: number) => {
         // clicking tabs handler
         setActiveTabIndex(newTabIndex)
      },
      []
   )

   const jobHasNoContent = Boolean(
      job.livestreams.length == 0 && job.sparks.length == 0
   )

   const tabs = useMemo(
      () => [
         {
            label: "Applicants",
            component: () =>
               allowToDisplayApplicantsData ? (
                  <JobApplicants jobId={job.id} />
               ) : (
                  <NoApplicantsData />
               ),
         },
         ...(jobHubV1 && !job.isPermanentlyExpired
            ? [
                 {
                    label: "Linked content",
                    component: () => <LinkedContent job={job} />,
                 },
              ]
            : []),
         {
            label: "Job Opening",
            component: () => <JobPosting job={job} group={group} />,
         },
      ],
      [allowToDisplayApplicantsData, group, job, jobHubV1]
   )

   if (!job) {
      return void push(`/group/${group.id}/admin/jobs`)
   }

   return (
      <Stack spacing={3} sx={styles.wrapper}>
         <Box
            component={Link}
            noLinkStyle
            href={`/group/${group.id}/admin/jobs`}
            sx={styles.backButton}
         >
            <ChevronLeft sx={{ width: "24px", height: "24px" }} />
            {job.title}
         </Box>

         <Tabs
            value={activeTabIndex}
            onChange={switchTabHandler}
            textColor="secondary"
            variant="scrollable"
            allowScrollButtonsMobile
            aria-label="job details tabs"
            TabIndicatorProps={{
               sx: [
                  styles.indicator,
                  ...(jobHubV1 && !job.isPermanentlyExpired
                     ? [
                          activeTabIndex === TabsEnum.LINKED_CONTENT &&
                             jobHasNoContent &&
                             styles.jobWarningIndicator,
                       ]
                     : []),
               ],
            }}
            sx={styles.tabs}
         >
            <Tab
               key={"Applicants"}
               label={
                  <Box sx={styles.applicantsTab}>
                     <Typography
                        sx={{
                           ...styles.tabsLabel,
                           ...(activeTabIndex === TabsEnum.APPLICATION &&
                              styles.activeTab),
                        }}
                     >
                        Applicants
                     </Typography>
                  </Box>
               }
            />

            {jobHubV1 && !job.isPermanentlyExpired ? (
               <Tab
                  key={"Linked content"}
                  label={
                     <Box sx={styles.applicantsTab}>
                        <Typography
                           sx={{
                              ...styles.tabsLabel,
                              ...(activeTabIndex === TabsEnum.LINKED_CONTENT &&
                                 styles.activeTab),
                              ...(jobHasNoContent && styles.warningTab),
                           }}
                        >
                           Linked content
                        </Typography>
                        {jobHasNoContent ? (
                           <Box
                              component={AlertCircle}
                              sx={styles.warningAlert}
                           />
                        ) : null}
                     </Box>
                  }
               />
            ) : null}

            <Tab
               key={"Job posting"}
               label={
                  <Typography
                     sx={{
                        ...styles.tabsLabel,
                        ...(activeTabIndex === TabsEnum.JOB_POSTING &&
                           styles.activeTab),
                     }}
                  >
                     Job posting
                  </Typography>
               }
            />
         </Tabs>

         <Box>
            <SwipeableViews
               index={activeTabIndex}
               onChangeIndex={switchTabHandler}
            >
               {tabs.map((tab, i) => (
                  <SwipeablePanel
                     key={tab.label}
                     value={activeTabIndex}
                     index={i}
                  >
                     <SuspenseWithBoundary
                        fallback={
                           <SkeletonStackMultiple quantity={1} height={150} />
                        }
                     >
                        {tab.component()}
                     </SuspenseWithBoundary>
                  </SwipeablePanel>
               ))}
            </SwipeableViews>
         </Box>
      </Stack>
   )
}

export default JobAdminDetails
