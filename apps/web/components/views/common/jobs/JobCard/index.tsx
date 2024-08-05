import { Job } from "@careerfairy/shared-lib/ats/Job"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, ButtonBase, Grid, useTheme } from "@mui/material"
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
      borderRadius: "16px 0 0 16px",
      p: 0.5,
   },
   listItemContainer: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderRadius: "16px",
      background: "white",
      border: "1px solid #ECECEC",
   },
   itemWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      width: "100%",
      maxWidth: "calc(100% - 8px)",
      p: { md: 2 },
   },
   infoWrapper: {
      p: { xs: 2, md: 0 },
   },
   jobCard: (theme) => ({
      display: "flex",
      alignItems: "center",
      alignSelf: "stretch",
      borderRadius: 2,
      border: `1px solid ${theme.brand.white[500]}`,
      background: theme.brand.white[100],
      overflow: "hidden",
      width: "100%",
      textAlign: "left",
      font: "inherit",

      "&:hover": {
         background: theme.brand.white[300],
      },
   }),
   statsWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "end",
      px: { xs: 1.5, md: 0 },
      pb: { xs: 1.5, md: 0 },
   },
})

type Props = {
   job: Job | CustomJob
   clicks?: number
   applicants?: number
   previewMode?: boolean
   handleClick: (job: Job | CustomJob) => void
   smallCard?: boolean
}

const JobCard = ({
   job,
   clicks,
   applicants,
   previewMode,
   handleClick,
   smallCard,
}: Props) => {
   const isAtsJob = useIsAtsJob(job)
   const isMobile = useIsMobile()
   const theme = useTheme()

   const showAdditionalInfo = clicks !== undefined && applicants !== undefined

   const getStateColor = useCallback(
      (job: CustomJob): string => {
         if (job.published) {
            return theme.palette.primary[300]
         }

         // Job has no content associated to it and it's not expired
         if (isJobValidButNoLinkedContent(job)) {
            return theme.palette.warning.main
         }

         return theme.brand.black[500]
      },
      [theme]
   )

   return (
      <ButtonBase
         key={job.id}
         onClick={() => handleClick(job)}
         sx={styles.jobCard}
         focusRipple
      >
         <Grid container>
            <Box sx={styles.listItemContainer}>
               {isAtsJob ? null : (
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
                     />
                  </Grid>

                  {showAdditionalInfo && !previewMode ? (
                     <Grid item xs={12} md={7} lg={6} sx={styles.statsWrapper}>
                        <JobCardStats clicks={clicks} applicants={applicants} />
                     </Grid>
                  ) : null}

                  {!isMobile && !smallCard && (
                     <JobCardAction job={job} previewMode={previewMode} />
                  )}
               </Box>
            </Box>
         </Grid>
      </ButtonBase>
   )
}

export default JobCard
