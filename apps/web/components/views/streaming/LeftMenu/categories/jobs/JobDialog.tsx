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
import { Stack } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import SanitizedHTML from "../../../../../util/SanitizedHTML"

const styles = sxStyles({
   infoItem: {
      display: "flex",
      alignSelf: "end",
   },
   itemLabel: {
      fontWeight: "bold",
      ml: 2,
   },
   uploadCvWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: { xs: "start", md: "center" },
   },
   studentsInfoWrapper: {
      display: "flex",
      alignSelf: "center",
      ml: 2,
   },
   studentsMessage: {
      variant: "body2",
      ml: 1,
      alignSelf: "center",
   },
   uploadCvButton: {
      display: "flex",
      ml: { md: 6 },
      mt: { xs: 2, md: 0 },
   },
   uploadCvLabel: {
      display: "flex",
      alignItems: "end",
   },
})

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
         title={`Apply to Job`}
         titleOnCenter={true}
         additionalLeftButton={renderApplyButton}
      >
         <Stack spacing={3} padding={2}>
            <Box display="flex">
               <WorkOutlineOutlinedIcon color="secondary" fontSize="large" />
               <Box sx={styles.infoItem}>
                  <Typography variant="h6" sx={styles.itemLabel}>
                     Title
                  </Typography>
                  <Typography variant="h6" ml={4}>
                     {job.name}
                  </Typography>
               </Box>
            </Box>

            {hiringManagers && (
               <Box display="flex">
                  <PersonOutlineOutlinedIcon
                     color="secondary"
                     fontSize="large"
                  />
                  <Box sx={styles.infoItem}>
                     <Typography variant="h6" sx={styles.itemLabel}>
                        Hiring Manager
                     </Typography>
                     <Typography variant="h6" ml={4}>
                        {hiringManagers}
                     </Typography>
                  </Box>
               </Box>
            )}

            <Box>
               <Box display="flex">
                  <ChatBubbleOutlineRoundedIcon
                     color="secondary"
                     fontSize="large"
                  />
                  <Box sx={styles.infoItem}>
                     <Typography variant="h6" sx={styles.itemLabel}>
                        Job Description
                     </Typography>
                  </Box>
               </Box>
               <Typography variant="h6" mt={1}>
                  <SanitizedHTML htmlString={job.description} />
               </Typography>
            </Box>

            <Box sx={styles.uploadCvWrapper}>
               <Box sx={styles.uploadCvLabel}>
                  <DescriptionOutlinedIcon color="secondary" fontSize="large" />
                  <Box display="flex">
                     <Typography variant="h6" sx={styles.itemLabel}>
                        Upload CV
                     </Typography>
                  </Box>
               </Box>

               {userData && (
                  <Box sx={styles.uploadCvButton}>
                     <Box>
                        <UserResume
                           userData={userData}
                           showOnlyButton={true}
                           disabled={isStreamer || alreadyApplied}
                        />
                     </Box>
                     {isStreamer && (
                        <Box sx={styles.studentsInfoWrapper}>
                           <InfoOutlinedIcon />
                           <Typography sx={styles.studentsMessage}>
                              Only for students
                           </Typography>
                        </Box>
                     )}
                  </Box>
               )}
            </Box>

            {!userData && (
               <Box>
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
               </Box>
            )}
         </Stack>
      </GenericDialog>
   )
}

type Props = {
   job: Job
   onCloseDialog: () => any
   livestreamId: string
}
export default JobDialog
