import React, { useEffect } from "react"
import { Grid, Typography } from "@mui/material"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import { useAuth } from "../../../../HOCs/AuthProvider"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import { styles } from "../profileStyles"
import useUserJobApplications from "../../../custom-hook/useUserJobApplications"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import {
   JobApplicationCard,
   JobApplicationCardSkeleton,
} from "./JobApplicationCard"
import Stack from "@mui/material/Stack"
import { atsServiceInstance } from "../../../../data/firebase/ATSService"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"

const initialTabs = [
   {
      label: "Groups you've joined",
      value: "joined",
      href: "/profile/groups?type=joined",
   },
]

const adminTab = {
   label: "Groups you manage",
   value: "admin",
   href: "/profile/groups?type=admin",
}
const Jobs = () => {
   const { errorNotification } = useSnackbarNotifications()
   useEffect(() => {
      atsServiceInstance
         .updateUserJobApplications()
         .catch((e) =>
            errorNotification(e, "Failed to update your job applications")
         )
   }, [])
   return (
      <ContentCard>
         <Grid container spacing={2}>
            <Grid item xs={12} lg={8}>
               <ContentCardTitle>My Jobs</ContentCardTitle>
            </Grid>

            <Grid item xs={12} lg={8}>
               <Typography sx={styles.subtitle}>
                  During a Livestream event you can apply to job openings and
                  they will appear here.
               </Typography>
            </Grid>
            <Grid item xs={12} lg={8}>
               <SuspenseWithBoundary
                  fallback={
                     <Stack spacing={2}>
                        <JobApplicationCardSkeleton />
                        <JobApplicationCardSkeleton />
                        <JobApplicationCardSkeleton />
                     </Stack>
                  }
               >
                  <OpenApplications />
               </SuspenseWithBoundary>
            </Grid>
         </Grid>
      </ContentCard>
   )
}

const OpenApplications = () => {
   const { userData } = useAuth()
   const { data } = useUserJobApplications(userData.id)
   console.log("-> data", data)
   return (
      <Stack spacing={2}>
         {data.map((application) => (
            <JobApplicationCard
               key={application.id}
               jobApplication={application}
            />
         ))}
      </Stack>
   )
}

export default Jobs
