import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import Box from "@mui/material/Box"
import {
   userAlreadyAppliedForJob,
   UserData,
} from "@careerfairy/shared-lib/dist/users"
import ContentCard from "../../../../../../layouts/UserLayout/ContentCard"
import React, { useCallback, useEffect, useState } from "react"
import { atsServiceInstance } from "../../../../../../data/firebase/ATSService"
import useUserATSRelations from "../../../../../custom-hook/useUserATSRelations"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import * as Sentry from "@sentry/nextjs"
import LoadingButton from "@mui/lab/LoadingButton"
import dynamic from "next/dynamic"
import { Typography } from "@mui/material"

type Props = {
   job: Job
   livestreamId: string
}

const UserResume = dynamic(
   () => import("../../../../profile/userData/user-resume/UserResume"),
   { ssr: false }
)

const requiredDataToApply: RequiredData[] = [
   {
      field: "userResume",
      component: (userData: UserData) => (
         <ContentCard>
            <UserResume userData={userData} />
         </ContentCard>
      ),
   },
]

const JobEntryApply = ({ job, livestreamId }: Props) => {
   const { userData } = useAuth()
   const atsRelations = useUserATSRelations(userData.id)
   const [isLoading, setIsLoading] = useState(false)
   const [alreadyApplied, setAlreadyApplied] = useState(false)
   const { successNotification, errorNotification } = useSnackbarNotifications()

   // Confirm if user already applied to this job
   useEffect(() => {
      if (
         atsRelations &&
         userAlreadyAppliedForJob(atsRelations, job.id) &&
         !alreadyApplied
      ) {
         setAlreadyApplied(true)
      }
   }, [alreadyApplied, atsRelations, job.id])

   // Apply to the job
   const onClickApply = useCallback(() => {
      setIsLoading(true)
      atsServiceInstance
         .applyToAJob(livestreamId, job.id)
         .then(() => {
            setAlreadyApplied(true)
            successNotification("You have successfully applied to the job!")
         })
         .catch((e) => {
            console.error(e)
            Sentry.captureException(e)
            errorNotification("Sorry! Something failed, maybe try again later")
         })
         .finally(() => {
            setIsLoading(false)
         })
   }, [livestreamId, job.id, successNotification, errorNotification])

   if (alreadyApplied) {
      return (
         <Box textAlign="center">
            <Typography fontWeight="bold" color="primary" mt={6} variant="h5">
               Congrats! You have already applied to this job!
            </Typography>
         </Box>
      )
   }

   const missingDataComponents = []

   for (let requiredDataToApplyElement of requiredDataToApply) {
      if (!userData[requiredDataToApplyElement.field]) {
         missingDataComponents.push(requiredDataToApplyElement.component)
      }
   }

   return (
      <Box display={"flex"}>
         <LoadingButton
            loading={isLoading}
            variant="contained"
            color="primary"
            size={"large"}
            onClick={onClickApply}
            disabled={missingDataComponents.length > 0}
            sx={{ width: "195px" }}
         >
            Apply Now
         </LoadingButton>
      </Box>
   )
}

type RequiredData = {
   field: string
   component: (userData: UserData) => JSX.Element
}

export default JobEntryApply
