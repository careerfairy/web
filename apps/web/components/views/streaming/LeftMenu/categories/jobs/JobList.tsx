import useLivestreamJobs from "../../../../../custom-hook/useLivestreamJobs"
import {
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
} from "@mui/material"
import WorkHistoryIcon from "@mui/icons-material/WorkHistory"
import GenericDialog from "../../../../common/GenericDialog"
import { useCallback, useMemo, useState } from "react"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import Box from "@mui/material/Box"
import JobEntryApply from "./JobEntryApply"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import Link from "../../../../common/Link"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"
import { SuspenseWithBoundary } from "../../../../../ErrorBoundary"

const JobList = ({ livestream }) => {
   const { jobs } = useLivestreamJobs(undefined, livestream.jobs)
   const [selectedJob, setSelectedJob] = useState(null)

   const onCloseDialog = useCallback(() => {
      setSelectedJob(null)
   }, [])

   if (jobs.length === 0) {
      return <div>No jobs at the moment</div>
   }

   return (
      <>
         <List>
            {jobs.map((job) => (
               <ListItem
                  disablePadding
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
               >
                  <ListItemButton>
                     <ListItemIcon>
                        <WorkHistoryIcon />
                     </ListItemIcon>
                     <ListItemText primary={job.getExtendedName()} />
                  </ListItemButton>
               </ListItem>
            ))}
         </List>
         {selectedJob && (
            <JobApplyDialog
               job={selectedJob}
               onCloseDialog={onCloseDialog}
               livestreamId={livestream.id}
            />
         )}
      </>
   )
}

type DialogProps = {
   job: Job
   onCloseDialog: () => any
   livestreamId: string
}
const JobApplyDialog = ({ job, onCloseDialog, livestreamId }: DialogProps) => {
   const { userData } = useAuth()
   const { isStreamer } = useCurrentStream()

   const hiringManagers = useMemo(
      () => job.hiringManagers.map((manager) => manager.getName()).join(", "),
      [job.hiringManagers]
   )

   return (
      <GenericDialog onClose={onCloseDialog} title={`Apply to ${job.name}`}>
         <Box>
            <p>
               <strong>Status: </strong>
               {job.status}
            </p>
            {hiringManagers && (
               <p>
                  <strong>Hiring Managers: </strong>
                  {hiringManagers}
               </p>
            )}
            <p>
               <strong>Job Description: </strong>
               {job.description}
            </p>

            <Box mt={2}>
               {!userData && (
                  <Box>
                     <strong>
                        You need to sign in to be able to apply to jobs.
                     </strong>
                     <Link
                        href={`/login?absolutePath=/streaming/${livestreamId}/viewer`}
                     >
                        Sign In
                     </Link>
                  </Box>
               )}
               {userData && !isStreamer && (
                  <SuspenseWithBoundary>
                     <JobEntryApply job={job} livestreamId={livestreamId} />
                  </SuspenseWithBoundary>
               )}
               {isStreamer && (
                  <Box>Students (Viewers) can apply to this job. </Box>
               )}
            </Box>
         </Box>
      </GenericDialog>
   )
}

export default JobList
