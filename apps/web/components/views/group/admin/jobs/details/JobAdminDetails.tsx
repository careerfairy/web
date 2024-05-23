import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { Box, Tab, Tabs, Tooltip, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
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
import PendingContent from "./linkedContent/PendingContent"

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
      backgroundColor: "#6749EA !important",
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
      color: "#8E8E8E",
   },
   tabs: {
      borderBottom: "1px solid #D6D6E0",

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

const JobAdminDetails: FC<Props> = ({ job }) => {
   const [activeTabIndex, setActiveTabIndex] = useState(0)
   const { group } = useGroup()
   const { push } = useRouter()

   const newJobHub = group.newJobHub

   enum TabsEnum {
      APPLICATION = 0,
      LINKED_CONTENT = newJobHub ? 1 : -1,
      JOB_POSTING = newJobHub ? 2 : 1,
   }

   const allowToDisplayApplicantsData = group.privacyPolicyActive

   const switchTabHandler = useCallback(
      (_: React.SyntheticEvent, newTabIndex: number) => {
         // clicking tabs handler
         setActiveTabIndex(newTabIndex)
      },
      []
   )

   const jobHasNoContent = newJobHub
      ? Boolean(job.livestreams.length == 0 && job.sparks.length == 0)
      : false

   const tabs = useMemo(() => {
      const tabs = [
         {
            label: "Applicants",
            component: () =>
               allowToDisplayApplicantsData ? (
                  <JobApplicants jobId={job.id} />
               ) : (
                  <NoApplicantsData />
               ),
         },
      ]

      if (newJobHub) {
         tabs.push({
            label: "Linked content",
            component: () =>
               jobHasNoContent ? (
                  <PendingContent job={job} group={group} />
               ) : (
                  <LinkedContent job={job} />
               ),
         })
      }

      tabs.push({
         label: "Job Opening",
         component: () => <JobPosting job={job} group={group} />,
      })

      return tabs
   }, [allowToDisplayApplicantsData, group, job, jobHasNoContent, newJobHub])

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
                  activeTabIndex === TabsEnum.LINKED_CONTENT &&
                     jobHasNoContent &&
                     styles.jobWarningIndicator,
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
                     <Tooltip
                        title={
                           "You may not see all applicants, as it only includes those who have indicated they applied. Additional talent may have applied through our platform."
                        }
                        sx={styles.tooltip}
                     >
                        <InfoIcon />
                     </Tooltip>
                  </Box>
               }
            />
            {newJobHub ? (
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
