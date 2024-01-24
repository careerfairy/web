import React, { FC } from "react"
import Box from "@mui/material/Box"
import SectionTitle from "./SectionTitle"
import LinkifyText from "../../../../../util/LinkifyText"
import { Typography } from "@mui/material"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { sxStyles } from "../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import Skeleton from "@mui/material/Skeleton"
import { Check } from "react-feather"

const styles = sxStyles({
   companyName: {
      fontSize: "2.28rem",
   },
   summary: {
      fontSize: "1.285rem",
      whiteSpace: "pre-line",
   },
   reasonsContainer: {
      display: "flex",
      alignItems: "center",
   },
   reasons: {
      whiteSpace: "pre-line",
      fontSize: "1.1428rem",
   },
   reasonsCheck: {
      marginRight: 10,
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
   const reasonsToJoinLivestream_v1 = presenter.reasonsToJoinLivestream.trim()
   const reasonsToJoinLivestream_v2 =
      presenter.reasonsToJoinLivestream_v2.filter(
         (reason) => reason.trim() !== ""
      )

   const hasReasonsToJoinLivestream_v1 = Boolean(reasonsToJoinLivestream_v1)
   const hasReasonsToJoinLivestream_v2 = Boolean(
      reasonsToJoinLivestream_v2 && reasonsToJoinLivestream_v2.length > 0
   )

   const reasonsToJoinLivestream = hasReasonsToJoinLivestream_v2
      ? reasonsToJoinLivestream_v2
      : reasonsToJoinLivestream_v1.split("\n")

   console.log(
      reasonsToJoinLivestream_v1,
      hasReasonsToJoinLivestream_v1,
      reasonsToJoinLivestream_v2,
      hasReasonsToJoinLivestream_v2,
      reasonsToJoinLivestream
   )

   if (!hasReasonsToJoinLivestream_v1 && !hasReasonsToJoinLivestream_v2) {
      return null
   }

   return (
      <Box>
         <SectionTitle>Why should you join the Live Stream?</SectionTitle>
         <LinkifyText>
            <Stack spacing={2.25} sx={styles}>
               {reasonsToJoinLivestream.map((reason) => (
                  <Typography
                     key={reason}
                     sx={[
                        styles.reasons,
                        Boolean(hasReasonsToJoinLivestream_v2) &&
                           styles.reasonsContainer,
                     ]}
                  >
                     {Boolean(hasReasonsToJoinLivestream_v2) && (
                        <Check color="#29BAA5" style={styles.reasonsCheck} />
                     )}{" "}
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
