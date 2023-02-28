import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, Typography, Grid } from "@mui/material"
import { useFirestoreDocument } from "components/custom-hook/utils/useFirestoreDocument"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Briefcase, User } from "react-feather"
import { useNextLivestreamCardLogic } from "./NextLivestreamCard"

export const LivestreamStats = ({
   livestream,
}: {
   livestream: LivestreamEvent
}) => {
   const { isDraft } = useNextLivestreamCardLogic()

   const applications = (
      <Box display="flex" alignItems="center">
         <Briefcase width={20} />
         <Typography ml={2}>
            In-stream application: {livestream.jobs?.length > 0 ? "Yes" : "No"}
         </Typography>
      </Box>
   )

   if (isDraft()) {
      return <Box mt={2}>{applications}</Box>
   }

   return (
      <Box display="flex" sx={{ flexWrap: "wrap" }}>
         <Box mt={{ xs: 1, sm: 2 }} mr={4}>
            <Box display="flex" alignItems="center">
               <User />
               <Typography ml={2}>
                  <SuspenseWithBoundary fallback={"0"} hide>
                     <RegisteredUsersValue livestreamId={livestream.id} />
                  </SuspenseWithBoundary>{" "}
                  registered
               </Typography>
            </Box>
         </Box>
         <Box mt={{ xs: 1, sm: 2 }}>{applications}</Box>
      </Box>
   )
}

const RegisteredUsersValue = ({ livestreamId }: { livestreamId: string }) => {
   const { group } = useGroup()
   const data = useFirestoreDocument<LiveStreamStats>("livestreams", [
      livestreamId,
      "stats",
      "livestreamStats",
   ])

   let count = data.data?.generalStats?.numberOfRegistrations ?? 0
   if (
      group.universityId &&
      data.data?.universityStats?.[group.universityId]?.numberOfRegistrations
   ) {
      count =
         data.data.universityStats[group.universityId].numberOfRegistrations
   }

   return <>{count}</>
}
