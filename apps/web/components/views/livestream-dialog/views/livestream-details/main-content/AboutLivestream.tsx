import React, { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import LinkifyText from "../../../../../util/LinkifyText"
import { Typography } from "@mui/material"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import Skeleton from "@mui/material/Skeleton"

const styles = sxStyles({
   companyName: {
      fontSize: "2.28rem",
   },
   summary: {
      fontSize: "1.285rem",
      whiteSpace: "pre-line",
   },
   reasons: {
      whiteSpace: "pre-line",
      fontSize: "1.1428rem",
   },
})

interface Props {
   presenter: LivestreamPresenter
}

const AboutLivestream: FC<Props> = ({ presenter }) => {
   return (
      <Box>
         <SectionTitle>About the live stream</SectionTitle>
         <Typography sx={styles.companyName} component="h3">
            {presenter.company}
         </Typography>
         <Stack spacing={6}>
            <LinkifyText>
               <Typography sx={styles.summary}>{presenter.summary}</Typography>
            </LinkifyText>
            <ReasonsToJoin presenter={presenter} />
         </Stack>
      </Box>
   )
}

type ReasonToJoinProps = {
   presenter: LivestreamPresenter
}

const ReasonsToJoin: FC<ReasonToJoinProps> = ({ presenter }) => {
   const reasonsToJoinLivestream = presenter.reasonsToJoinLivestream.trim()
   const hasReasonsToJoinLivestream = Boolean(reasonsToJoinLivestream)

   if (!hasReasonsToJoinLivestream) {
      return null
   }

   return (
      <Box>
         <SectionTitle>Why should you join the Live Stream?</SectionTitle>
         <LinkifyText>
            <Stack spacing={2.25}>
               {reasonsToJoinLivestream.split("\n").map((reason) => (
                  <Typography key={reason} sx={styles.reasons}>
                     {reason}
                  </Typography>
               ))}
            </Stack>
         </LinkifyText>
      </Box>
   )
}

export const AboutLivestreamSkeleton: FC = () => {
   return (
      <Box>
         <SectionTitle>About the live stream</SectionTitle>
         <Typography sx={styles.companyName} component="h3">
            <Skeleton width={130} />
         </Typography>
         <Stack spacing={6}>
            <Typography width="100%" sx={styles.summary}>
               {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} />
               ))}
               <Skeleton width="50%" />
            </Typography>
            <Box>
               <SectionTitle>Why should you join the Live Stream?</SectionTitle>
               <LinkifyText>
                  <Stack spacing={2.25}>
                     <Typography width="100%" sx={styles.reasons}>
                        {Array.from({ length: 3 }).map((_, i) => (
                           <Skeleton key={i} />
                        ))}
                     </Typography>
                  </Stack>
               </LinkifyText>
            </Box>
         </Stack>
      </Box>
   )
}

export default AboutLivestream
