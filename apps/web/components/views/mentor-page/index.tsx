import { Group } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack } from "@mui/material"
import { BackButton } from "./BackButton"
import { LivestreamsCarousel } from "./LivestreamsCarousel"
import { MentorDetail } from "./MentorDetail"
import { SparksCarousel } from "./SparksCarousel"

const SLIDE_WIDTH = 368

const styles = sxStyles({
   root: {
      flexDirection: {
         xs: "column",
         md: "row",
      },
      gap: { xs: "20px", md: "16px" },
      paddingLeft: {
         xs: "0px",
         md: "32px",
      },
      paddingBottom: {
         xs: "72px",
      },
   },
   mentorDetailsContainer: {
      position: "relative",
      width: {
         xs: "100%",
         md: `${SLIDE_WIDTH}px`,
      },
      padding: "54px 26px 28px 26px",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      flexShrink: 0,
      alignSelf: "stretch",
      borderRadius: "18px",
      background: "#FFF",
   },
   mentorContentContainer: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      width: "100%",
      padding: {
         xs: "16px",
      },
   },
   rule: {
      background: "#E4E4E4",
      height: "1px",
      width: "100%",
   },
})

type MentorDetailPageProps = {
   group: Group
   mentor: PublicCreator
   livestreams: LivestreamEvent[]
   sparks: Spark[]
   hasJobs: boolean
}

export const MentorDetailPage = ({
   group,
   mentor,
   livestreams,
   sparks,
   hasJobs,
}: MentorDetailPageProps) => {
   return (
      <Stack sx={styles.root}>
         <Box sx={styles.mentorDetailsContainer}>
            <BackButton />
            <MentorDetail
               mentor={mentor}
               group={group}
               numSparks={sparks.length}
               numLivestreams={livestreams.length}
               hasJobs={hasJobs}
            />
         </Box>
         <Stack sx={styles.mentorContentContainer}>
            {Boolean(sparks.length) && <SparksCarousel sparks={sparks} />}
            {livestreams.length > 0 && sparks.length > 0 ? (
               <Box sx={styles.rule} />
            ) : null}
            {Boolean(livestreams.length) && (
               <LivestreamsCarousel livestreams={livestreams} />
            )}
         </Stack>
      </Stack>
   )
}
