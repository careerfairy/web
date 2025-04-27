import { Job } from "@careerfairy/shared-lib/ats/Job"
import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, ButtonBase, Grid, SxProps, useTheme } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import useIsJobExpired from "components/custom-hook/custom-job/useIsJobExpired"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsAtsJob from "components/custom-hook/useIsAtsJob"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import { isJobValidButNoLinkedContent } from "../utils"
import JobCardAction from "./JobCardAction"
import JobCardDetails from "./JobCardDetails"
import JobCardStats from "./JobCardStats"
const styles = sxStyles({
   jobState: {
      display: "flex",
      borderRadius: "8px 0 0 8px",
      width: "8px",
   },
   listItemContainer: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderRadius: "8px",
      background: "white",
      border: "1px solid #ECECEC",
      borderLeft: "none",
   },
   itemWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      width: "100%",
      maxWidth: "calc(100% - 8px)",
      p: { md: 1.5 },
      alignItems: { md: "center" },
   },
   infoWrapper: {
      p: { xs: 2, md: 0 },
   },
   jobCard: {
      display: "flex",
      width: "100%",
      textAlign: "left",
   },
   statsWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "end",
   },
})

type Props = {
   job: Job | CustomJob
   clicks?: number
   applicants?: number
   views?: number
   previewMode?: boolean
   handleClick?: (job: Job | CustomJob, event?: React.MouseEvent) => void
   smallCard?: boolean
   hideJobUrl?: boolean
   titleSx?: SxProps<DefaultTheme>
   typographySx?: SxProps<DefaultTheme>
   companyName?: string
   applied?: boolean
}

const JobCard = ({
   job,
   clicks,
   applicants,
   views,
   previewMode,
   handleClick,
   smallCard,
   hideJobUrl,
   titleSx,
   typographySx,
   companyName,
   applied,
}: Props) => {
   const isJobExpired = useIsJobExpired(job as PublicCustomJob)

   const isAtsJob = useIsAtsJob(job)
   const isMobile = useIsMobile()
   const theme = useTheme()
   const { jobHubV1 } = useFeatureFlags()
   const showAdditionalInfo = clicks !== undefined && applicants !== undefined

   const getStateColor = useCallback(
      (job: CustomJob): string => {
         if (applied) {
            return theme.palette.primary[300]
         }

         if (isJobExpired) {
            return theme.brand.black[500]
         }

         if (job.published) {
            return theme.palette.primary[300]
         }

         // Job has no content associated to it and it's not expired
         if (isJobValidButNoLinkedContent(job)) {
            return theme.palette.warning.main
         }

         return theme.brand.black[500]
      },
      [theme, isJobExpired, applied]
   )

   return (
      <ButtonBase
         key={job.id}
         onClick={(event) => handleClick && handleClick(job, event)}
         sx={styles.jobCard}
         focusRipple
      >
         <Grid container>
            <Box sx={styles.listItemContainer}>
               {isAtsJob || !jobHubV1 ? null : (
                  <Box
                     sx={[styles.jobState, { background: getStateColor(job) }]}
                  />
               )}
               <Box sx={styles.itemWrapper}>
                  <Grid
                     item
                     xs={12}
                     md={smallCard ? 12 : previewMode ? 9 : 4.5}
                     lg={smallCard ? 12 : previewMode ? 9.5 : 5.5}
                     sx={styles.infoWrapper}
                  >
                     <JobCardDetails
                        job={job}
                        previewMode={previewMode}
                        smallCard={smallCard}
                        hideJobUrl={hideJobUrl}
                        titleSx={titleSx}
                        typographySx={typographySx}
                        companyName={companyName}
                     />
                  </Grid>

                  {showAdditionalInfo && !previewMode ? (
                     <Grid item xs={12} md={7} lg={6} sx={styles.statsWrapper}>
                        <JobCardStats
                           clicks={clicks}
                           applicants={applicants}
                           views={views}
                        />
                     </Grid>
                  ) : null}

                  {!isMobile && !smallCard && (
                     <JobCardAction
                        job={job}
                        previewMode={previewMode}
                        applied={applied}
                     />
                  )}
               </Box>
            </Box>
         </Grid>
      </ButtonBase>
   )
}

export default JobCard
