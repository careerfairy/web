import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import LinkifyText from "components/util/LinkifyText"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"
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

type Props = {
   companyName: LivestreamEvent["company"]
   summary: LivestreamEvent["summary"]
   reasonsToJoin: LivestreamEvent["reasonsToJoinLivestream_v2"]
}

const AboutLivestream = ({ companyName, summary, reasonsToJoin }: Props) => {
   return (
      <Box>
         <SectionTitle>About the live stream</SectionTitle>
         <Typography sx={styles.companyName} component="h3">
            {companyName}
         </Typography>
         <Stack spacing={6}>
            <LinkifyText>
               <Typography sx={styles.summary}>{summary}</Typography>
            </LinkifyText>
            <ReasonsToJoin reasonsToJoin={reasonsToJoin} />
         </Stack>
      </Box>
   )
}

type ReasonToJoinProps = {
   reasonsToJoin: LivestreamEvent["reasonsToJoinLivestream_v2"]
}

const ReasonsToJoin = ({ reasonsToJoin }: ReasonToJoinProps) => {
   return (
      <Box>
         <SectionTitle>Why should you join the Live Stream?</SectionTitle>
         <LinkifyText>
            <Stack spacing={2.25} sx={styles}>
               {reasonsToJoin.map((reason) => (
                  <Typography
                     key={reason}
                     sx={(styles.reasons, styles.reasonsContainer)}
                  >
                     <Check color="#29BAA5" style={styles.reasonsCheck} />{" "}
                     {reason}
                  </Typography>
               ))}
            </Stack>
         </LinkifyText>
      </Box>
   )
}

export const AboutLivestreamSkeleton = () => {
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
