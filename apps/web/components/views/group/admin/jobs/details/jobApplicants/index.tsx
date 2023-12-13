import { Box, Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import React, { FC, useCallback, useMemo } from "react"
import JobApplicantsList from "./JobApplicantsList"
import usePaginatedUsersCollection from "../../../analytics-new/live-stream/users/usePaginatedUsersCollection"
import { collection } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { DocumentPaths } from "../../../common/table/UserDataTableProvider"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { StyledPagination } from "../../../common/CardCustom"

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
   job: CustomJob
}

const JobApplicants: FC<Props> = ({ job }) => {
   const collectionQuery = useMemo(
      () => collection(FirestoreInstance, "userData"),
      []
   )

   const filters = useMemo(
      () => ({
         //  If there are applicants for the job, the filter includes their user IDs,
         //  otherwise, it includes an empty string to ensure the filter is applied,
         //  but no results are returned
         userIds: job.applicants.length ? job.applicants : [""],
      }),
      [job.applicants]
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
                     {job.clicks}
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
                     {job.applicants?.length || 0}
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
   userEmail: "id",
   orderBy: `firstName`,
   orderDirection: "asc",
}

const converterFn = (doc: Partial<UserData>): UserDataEntry => ({
   email: doc.userEmail,
   firstName: doc.firstName || "",
   lastName: doc.lastName || "",
   universityName: doc.university?.name || "",
   universityCountryCode: doc.universityCountryCode || "",
   fieldOfStudy: doc.fieldOfStudy?.name || "",
   levelOfStudy: doc.levelOfStudy?.name || "",
   linkedInUrl: doc.linkedinUrl || "",
   resumeUrl: doc.userResume || "",
   universityCountryName:
      universityCountryMap?.[doc.universityCountryCode] || "",
   avatar: doc.avatar,
})

export default JobApplicants
