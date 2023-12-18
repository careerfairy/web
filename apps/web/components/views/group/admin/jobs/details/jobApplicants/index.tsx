import { Box, Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { CustomJobApplicants } from "@careerfairy/shared-lib/customJobs/customJobs"
import React, { FC, useCallback, useMemo } from "react"
import JobApplicantsList from "./JobApplicantsList"
import usePaginatedUsersCollection, {
   Filters,
} from "../../../analytics-new/live-stream/users/usePaginatedUsersCollection"
import { collection } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { DocumentPaths } from "../../../common/table/UserDataTableProvider"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { StyledPagination } from "../../../common/CardCustom"
import useCustomJobStats from "../../../../../../custom-hook/useCustomJobStats"

const styles = sxStyles({
   statsSection: {
      display: "flex",
      flexDirection: "column",
      px: 2,
      py: 1,
      borderRadius: 2,
      background: "white",
      border: "1px solid #F0EDFD",
   },
   statsLabel: {
      fontSize: "14px",
   },
   statsValue: {
      fontSize: "20px",
      fontWeight: "bold",
   },
   pagination: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
   },
})

type Props = {
   jobId: string
   groupId: string
}

const JobApplicants: FC<Props> = ({ jobId, groupId }) => {
   const jobStats = useCustomJobStats(jobId, groupId)

   const collectionQuery = useMemo(
      () => collection(FirestoreInstance, "jobApplications"),
      []
   )

   const filters = useMemo<Partial<Filters>>(
      () => ({
         jobId,
      }),
      [jobId]
   )

   const paginatedResults = usePaginatedUsersCollection(
      collectionQuery,
      documentPaths,
      10,
      filters
   )

   const applicants = useMemo(() => {
      return paginatedResults.data?.map(converterFn) || []
   }, [paginatedResults])

   const onPageChange = useCallback(
      (_, page: number) => {
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
            <Grid item xs={6}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"grey"}
                     sx={styles.statsLabel}
                  >
                     Total clicks
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {jobStats.clicks}
                  </Typography>
               </Box>
            </Grid>

            <Grid item xs={6}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"grey"}
                     sx={styles.statsLabel}
                  >
                     Applications
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {jobStats.applicants}
                  </Typography>
               </Box>
            </Grid>
         </Grid>

         <JobApplicantsList applicants={applicants} />

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
      </>
   )
}

const documentPaths: Partial<DocumentPaths> = {
   jobId: "jobId",
   orderBy: `appliedAt`,
   orderDirection: "desc",
}

const converterFn = (doc: Partial<CustomJobApplicants>): UserDataEntry => ({
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

export default JobApplicants
