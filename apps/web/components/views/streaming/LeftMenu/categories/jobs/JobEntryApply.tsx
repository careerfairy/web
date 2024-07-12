import { Job } from "@careerfairy/shared-lib/ats/Job"
import { UserData } from "@careerfairy/shared-lib/users"
import LoadingButton from "@mui/lab/LoadingButton"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import dynamic from "next/dynamic"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import ContentCard from "../../../../../../layouts/UserLayout/ContentCard"
import useJobApply from "../../../../../custom-hook/ats/useJobApply"

type Props = {
   job: Job
   livestreamId: string
   isApplied: boolean
   handleAlreadyApply: (available: boolean) => void
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

const JobEntryApply = ({
   job,
   livestreamId,
   isApplied,
   handleAlreadyApply,
}: Props) => {
   const { userData } = useAuth()

   const { applyJob, isLoading } = useJobApply(
      userData,
      job,
      livestreamId,
      isApplied,
      handleAlreadyApply
   )

   if (isApplied) {
      return (
         <Box textAlign="center">
            <Typography fontWeight="bold" color="primary" variant="h5">
               Congrats! You have already applied to this job!
            </Typography>
         </Box>
      )
   }

   const missingDataComponents = []

   for (const requiredDataToApplyElement of requiredDataToApply) {
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
            onClick={applyJob}
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
