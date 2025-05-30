import { Box, Stack, Typography } from "@mui/material"
import { useCustomJobDetailsDialog } from "components/views/common/jobs/CustomJobDetailsProvider"
import * as React from "react"
import { sxStyles } from "types/commonTypes"
import CustomJobDescription from "./CustomJobDescription"
import CustomJobLinkedContents from "./CustomJobLinkedContents"
import { TabConfig } from "./TabsHeader"

const styles = sxStyles({
   root: {
      minHeight: "580px",
      background: (theme) => theme.brand.white[50],
      display: "flex",
      flexDirection: "column",
   },
   content: {
      px: 2,
      pt: 2,
      overflowY: "scroll",
   },
   jobDeadline: {
      pb: 2,
   },
   salaryRoot: {
      p: 2,
      borderRadius: "8px",
      background: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      display: "flex",
      alignItems: "flex-start",
      gap: 1,
      justifyContent: "center",
      flexDirection: "column",
   },
   salaryWrapper: {
      gap: "4px",
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
   },
   salary: {
      color: (theme) => theme.brand.black[800],
      fontWeight: 700,
   },
   salaryLabel: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 400,
   },
   salaryPeriodLabel: {
      color: (theme) => theme.palette.neutral[800],
      fontWeight: 400,
   },
})

type CustomJobsContentTabsProps = {
   tabsConfig: TabConfig[]
   scrollContainerRef: React.RefObject<HTMLDivElement>
   sectionRefs: React.RefObject<Array<React.RefObject<HTMLElement>>>
   hideLinkedSparks?: boolean
   hideLinkedLivestreams?: boolean
   disabledLinkedContentClick?: boolean
}

export const CustomJobsContentTabs = ({
   tabsConfig,
   scrollContainerRef,
   sectionRefs,
   hideLinkedSparks,
   hideLinkedLivestreams,
   disabledLinkedContentClick,
}: CustomJobsContentTabsProps) => {
   return (
      <Stack sx={styles.root}>
         <Stack
            sx={styles.content}
            direction={"column"}
            ref={scrollContainerRef}
         >
            {tabsConfig.map((tab, index) => (
               <Box
                  key={tab.id}
                  id={tab.id}
                  ref={
                     sectionRefs.current && sectionRefs.current[index]
                        ? sectionRefs.current[index]
                        : undefined
                  }
                  sx={{ pt: index === 0 ? 0 : 1.5 }}
               >
                  {tab.id === "overview" && <OverviewTab />}
                  {tab.id === "salary" && <SalaryTab />}
                  {tab.id === "insidelook" && (
                     <InsideLookTab
                        hideLinkedSparks={hideLinkedSparks}
                        hideLinkedLivestreams={hideLinkedLivestreams}
                        disabledLinkedContentClick={disabledLinkedContentClick}
                     />
                  )}
               </Box>
            ))}
         </Stack>
      </Stack>
   )
}

const OverviewTab = () => {
   const { customJob } = useCustomJobDetailsDialog()

   return (
      <CustomJobDescription
         job={customJob}
         jobDeadlineWrapperSx={styles.jobDeadline}
      />
   )
}

const SalaryTab = () => {
   const { customJob } = useCustomJobDetailsDialog()

   if (!customJob.salary?.length) return null

   return (
      <Box sx={styles.salaryRoot}>
         <Box sx={styles.salaryWrapper}>
            <Typography variant="small" sx={styles.salaryLabel}>
               Role salary
            </Typography>
            <Typography variant="brandedH4" sx={styles.salary}>
               {customJob.salary}{" "}
               <Typography variant="small" sx={styles.salaryPeriodLabel}>
                  /year
               </Typography>
            </Typography>
         </Box>
      </Box>
   )
}

type InsideLookTabProps = {
   hideLinkedSparks?: boolean
   hideLinkedLivestreams?: boolean
   disabledLinkedContentClick?: boolean
}

const InsideLookTab = ({
   hideLinkedSparks,
   hideLinkedLivestreams,
   disabledLinkedContentClick,
}: InsideLookTabProps) => {
   const { customJob } = useCustomJobDetailsDialog()

   return (
      <CustomJobLinkedContents
         job={customJob}
         disableEventClick={disabledLinkedContentClick}
         hideLinkedLivestreams={hideLinkedLivestreams}
         hideLinkedSparks={hideLinkedSparks}
      />
   )
}
