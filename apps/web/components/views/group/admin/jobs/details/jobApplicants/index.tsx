import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { Box, Grid, Typography } from "@mui/material"
import React, { FC, useCallback, useMemo } from "react"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useCustomJobStats from "../../../../../../custom-hook/custom-job/useCustomJobStats"
import usePaginatedJobApplicants from "../../../../../../custom-hook/custom-job/usePaginatedJobApplicants"
import { StyledPagination } from "../../../common/CardCustom"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import JobApplicantsList from "./JobApplicantsList"

const styles = sxStyles({
   statsSection: {
      display: "flex",
      flexDirection: "column",
      px: "12px",
      py: 1,
      borderRadius: 2,
      background: "white",
      border: "1px solid #F0EDFD",
      height: "100%",
   },
   statsLabel: {
      fontSize: { xs: "12px", md: "14px" },
   },
   statsValue: {
      fontSize: "20px",
      fontWeight: "bold",
      lineHeight: "30px",
   },
   pagination: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
   },
})

type Props = {
   jobId: string
}

const JobApplicants: FC<Props> = ({ jobId }) => {
   const jobStats = useCustomJobStats(jobId)

   const totalViews = jobStats.views || jobStats.applicants + jobStats.clicks
   const paginatedResults = usePaginatedJobApplicants(jobId)

   const applicants = useMemo(() => {
      return (
         paginatedResults.data
            ?.filter(filterCFUsersApplications)
            .map(convertJobApplicantToUserData) || []
      )
   }, [paginatedResults])

   const onPageChange = useCallback(
      (_: React.ChangeEvent<unknown>, page: number) => {
         if (page > paginatedResults.page) {
            paginatedResults.next()
         } else {
            paginatedResults.prev()
         }
      },
      [paginatedResults]
   )

   return (
      <>
         <Grid container spacing={1}>
            <Grid item xs={4}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"neutral.700"}
                     sx={styles.statsLabel}
                  >
                     Job posting views
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {totalViews}
                  </Typography>
               </Box>
            </Grid>
            <Grid item xs={4}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"neutral.700"}
                     sx={styles.statsLabel}
                  >
                     Initiated applications
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {jobStats.clicks}
                  </Typography>
               </Box>
            </Grid>

            <Grid item xs={4}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"neutral.700"}
                     sx={styles.statsLabel}
                  >
                     Confirmed applicants
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {jobStats.applicants}
                  </Typography>
               </Box>
            </Grid>
         </Grid>

         <JobApplicantsList applicants={applicants} />

         {applicants.length ? (
            <StyledPagination
               count={
                  paginatedResults.nextDisabled
                     ? paginatedResults.page
                     : paginatedResults.page + 1
               }
               page={paginatedResults.page}
               color="secondary"
               disabled={paginatedResults.loading}
               onChange={onPageChange}
               siblingCount={0}
               boundaryCount={0}
               size="small"
            />
         ) : null}
      </>
   )
}

const convertJobApplicantToUserData = (
   doc: Partial<CustomJobApplicant>
): UserDataEntry => ({
   email: doc.user.userEmail,
   firstName: doc.user.firstName || "",
   lastName: doc.user.lastName || "",
   universityName: doc.user.university?.name || "",
   universityCountryCode: doc.user.universityCountryCode || "",
   fieldOfStudy: doc.user.fieldOfStudy?.name || "",
   levelOfStudy: doc.user.levelOfStudy?.name || "",
   linkedInUrl: doc.user.linkedinUrl || "",
   resumeUrl: doc.user.userResume || "",
   universityCountryName:
      universityCountryMap?.[doc.user.universityCountryCode] || "",
   avatar: doc.user.avatar,
})

// to filter out all the applications done by CareerFairy users
const filterCFUsersApplications = (doc: Partial<CustomJobApplicant>) =>
   !doc.user.userEmail.includes("@careerfairy")

export default JobApplicants
