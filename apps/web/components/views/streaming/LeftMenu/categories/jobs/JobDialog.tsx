import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"
import React, { useMemo, useState } from "react"
import GenericDialog from "../../../../common/GenericDialog"
import Box from "@mui/material/Box"
import Link from "../../../../common/Link"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import JobEntryApply from "./JobEntryApply"
import Typography from "@mui/material/Typography"
import UserResume from "../../../../profile/userData/user-resume/UserResume"

const JobDialog = ({ job, onCloseDialog, livestreamId }: Props) => {
   let { userData } = useAuth()
   const { isStreamer } = useCurrentStream()
   const [alreadyApplied, setAlreadyApplied] = useState(false)

   const hiringManagers = job.getHiringManager()

   const renderApplyButton = useMemo((): JSX.Element => {
      if (isStreamer) {
         return null
      }

      return (
         <Box mr={4}>
            <SuspenseWithBoundary>
               <JobEntryApply
                  job={job}
                  livestreamId={livestreamId}
                  isApplied={alreadyApplied}
                  handleAlreadyApply={setAlreadyApplied}
               />
            </SuspenseWithBoundary>
         </Box>
      )
   }, [alreadyApplied, isStreamer, job, livestreamId])

   return (
      <GenericDialog
         onClose={onCloseDialog}
         title={`Apply Job`}
         titleOnCenter={true}
         additionalLeftButton={renderApplyButton}
      >
         <Box padding={2}>
            <Box display="flex">
               <WorkOutlineOutlinedIcon color="secondary" fontSize="large" />
               <Box display="flex" alignSelf="end">
                  <Typography variant="h6" fontWeight="bold" ml={2}>
                     Title
                  </Typography>
                  <Typography variant="h6" ml={4}>
                     {job.name}
                  </Typography>
               </Box>
            </Box>

            <Box display="flex" mt={3}>
               <InfoOutlinedIcon color="secondary" fontSize="large" />
               <Box display="flex" alignSelf="end">
                  <Typography variant="h6" fontWeight="bold" ml={2}>
                     Status
                  </Typography>
                  <Typography variant="h6" ml={4}>
                     {job.status}
                  </Typography>
               </Box>
            </Box>

            {hiringManagers && (
               <Box display="flex" mt={3}>
                  <PersonOutlineOutlinedIcon
                     color="secondary"
                     fontSize="large"
                  />
                  <Box display="flex" alignSelf="end">
                     <Typography variant="h6" fontWeight="bold" ml={2}>
                        Hiring Manager
                     </Typography>
                     <Typography variant="h6" ml={4}>
                        {hiringManagers}
                     </Typography>
                  </Box>
               </Box>
            )}

            <Box mt={3}>
               <Box display="flex">
                  <ChatBubbleOutlineRoundedIcon
                     color="secondary"
                     fontSize="large"
                  />
                  <Box display="flex" alignSelf="end">
                     <Typography variant="h6" fontWeight="bold" ml={2}>
                        Job Description
                     </Typography>
                  </Box>
               </Box>
               <Typography variant="h6" mt={1}>
                  {job.description}
               </Typography>
            </Box>

            <Box mt={3}>
               <Box display="flex">
                  <DescriptionOutlinedIcon color="secondary" fontSize="large" />
                  <Box display="flex" alignSelf="center">
                     <Typography variant="h6" fontWeight="bold" ml={2}>
                        Upload CV
                     </Typography>
                  </Box>
                  {userData && (
                     <Box sx={{ height: "36px" }} display="flex">
                        <Box ml={6} mt={-3}>
                           <UserResume
                              userData={userData}
                              showOnlyButton={true}
                              disabled={isStreamer || alreadyApplied}
                           />
                        </Box>
                        {isStreamer && (
                           <Box display="flex" alignSelf="end" ml={2}>
                              <InfoOutlinedIcon />
                              <Typography
                                 variant="body2"
                                 ml={1}
                                 alignSelf="center"
                              >
                                 Only for students
                              </Typography>
                           </Box>
                        )}
                     </Box>
                  )}
               </Box>
            </Box>

            <Box mt={3}>
               {!userData && (
                  <Box mt={4} display="flex">
                     <Typography fontWeight="bold" variant="body1" mr={1}>
                        You need to sign in to be able to apply to jobs.
                     </Typography>
                     <Link
                        href={`/login?absolutePath=/streaming/${livestreamId}/viewer`}
                     >
                        <Typography variant="body1" mr={1}>
                           Sign In
                        </Typography>
                     </Link>
                  </Box>
               )}
            </Box>
         </Box>
      </GenericDialog>
   )
}

type Props = {
   job: Job
   onCloseDialog: () => any
   livestreamId: string
}
export default JobDialog
