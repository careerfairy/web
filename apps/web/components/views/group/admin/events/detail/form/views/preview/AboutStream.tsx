import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { sxStyles } from "@careerfairy/shared-ui"
import { Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import LinkifyText from "components/util/LinkifyText"
import SectionTitle from "components/views/livestream-dialog/views/livestream-details/main-content/SectionTitle"
import { Check } from "react-feather"
import StaticSkeleton from "./StaticSkeleton"

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
            {companyName ? companyName : <StaticSkeleton width={130} />}
         </Typography>
         <Stack spacing={6}>
            <LinkifyText>
               {summary ? (
                  <Typography sx={styles.summary}>{summary}</Typography>
               ) : (
                  <SummarySkeleton />
               )}
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
               {reasonsToJoin && reasonsToJoin.length > 0 ? (
                  reasonsToJoin.map((reason) => (
                     <Typography
                        key={reason}
                        sx={(styles.reasons, styles.reasonsContainer)}
                     >
                        <Check color="#29BAA5" style={styles.reasonsCheck} />{" "}
                        {reason}
                     </Typography>
                  ))
               ) : (
                  <ReasonsToJoinSkeleton />
               )}
            </Stack>
         </LinkifyText>
      </Box>
   )
}

const SummarySkeleton = () => {
   return (
      <Typography width="100%" sx={styles.summary}>
         <StaticSkeleton />
         <StaticSkeleton />
         <StaticSkeleton />
         <StaticSkeleton />
         <StaticSkeleton />
         <StaticSkeleton />
         <StaticSkeleton width="50%" />
      </Typography>
   )
}

const ReasonsToJoinSkeleton = () => {
   return (
      <Typography width="100%" sx={styles.reasons}>
         <StaticSkeleton height={35} />
         <StaticSkeleton height={35} />
         <StaticSkeleton height={35} />
      </Typography>
   )
}

export default AboutLivestream
