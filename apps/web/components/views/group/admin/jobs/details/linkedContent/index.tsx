import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Typography } from "@mui/material"
import useCustomJobLinkedLivestreams from "components/custom-hook/custom-job/useCustomJobLinkedLivestreams"
import useCustomJobLinkedSparks from "components/custom-hook/custom-job/useCustomJobLinkedSparks"
import { FC } from "react"

type Props = {
   job: CustomJob
}

const LinkedContent: FC<Props> = ({ job }) => {
   const linkedLivestreams = useCustomJobLinkedLivestreams(job)
   const linkedSparks = useCustomJobLinkedSparks(job)

   return (
      <Box>
         {linkedLivestreams.length ? (
            <>
               <Typography>Livestreams :</Typography>

               {linkedLivestreams.map((livestream) => (
                  <Typography key={livestream.id}>
                     {livestream.title}
                  </Typography>
               ))}
            </>
         ) : null}

         {linkedSparks.length ? (
            <>
               <Typography sx={{ mt: 4 }}>Sparks :</Typography>

               {linkedSparks.map((spark) => (
                  <Typography key={spark.id}>{spark.id}</Typography>
               ))}
            </>
         ) : null}
      </Box>
   )
}

export default LinkedContent
