import { Box, Tabs, Tooltip, Typography } from "@mui/material"
import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import React, { FC, useCallback, useMemo, useState } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import ChevronLeft from "@mui/icons-material/ChevronLeft"
import Link from "../../../../common/Link"
import Tab from "@mui/material/Tab"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { SwipeablePanel } from "../../../../../../materialUI/GlobalPanels/GlobalPanels"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import { SkeletonStackMultiple } from "../../../../../util/Skeletons"
import SwipeableViews from "react-swipeable-views"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import JobPosting from "./jobPosting"
import JobApplicants from "./jobApplicants"
import NoApplicantsData from "./jobApplicants/NoApplicantsData"

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
   },
   tooltip: {
      ml: 1,
      color: "#8E8E8E",
   },
   tabs: {
      borderBottom: "1px solid #D6D6E0",
   },
})

type Props = {
   job: CustomJob
}

const JobAdminDetails: FC<Props> = ({ job }) => {
   const [activeTabIndex, setActiveTabIndex] = useState(0)
   const { group } = useGroup()

   const allowToDisplayApplicantsData = group.privacyPolicyActive

   const switchTabHandler = useCallback(
      (_: React.SyntheticEvent, newTabIndex: number) => {
         // clicking tabs handler
         setActiveTabIndex(newTabIndex)
      },
      []
   )

   const tabs = useMemo(
      () => [
         {
            label: "Applicants",
            component: () =>
               allowToDisplayApplicantsData ? (
                  <JobApplicants job={job} />
               ) : (
                  <NoApplicantsData />
               ),
         },
         {
            label: "Job Opening",
            component: () => <JobPosting job={job} group={group} />,
         },
      ],
      [allowToDisplayApplicantsData, group, job]
   )

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
            aria-label="job details tabs"
            TabIndicatorProps={{ sx: styles.indicator }}
            sx={styles.tabs}
         >
            <Tab
               key={"Applicants"}
               label={
                  <Box sx={styles.applicantsTab}>
                     <Typography
                        sx={{
                           ...styles.tabsLabel,
                           ...(activeTabIndex === 0 && styles.activeTab),
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
            <Tab
               key={"Job posting"}
               label={
                  <Typography
                     sx={{
                        ...styles.tabsLabel,
                        ...(activeTabIndex === 1 && styles.activeTab),
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
