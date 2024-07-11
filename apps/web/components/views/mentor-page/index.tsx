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
      position: "relative",
      display: "flex",
      flexDirection: "row",
      width: "100%",
      gap: "16px",
      paddingLeft: "32px",
   },
   mentorDetailsContainer: {
      position: "relative",
      display: "flex",
      width: `${SLIDE_WIDTH}px`,
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
      overflow: "hidden",
   },
})

type MentorDetailPageProps = {
   companyName: string
   mentor: PublicCreator
   livestreams: LivestreamEvent[]
   sparks: Spark[]
}

export const MentorDetailPage = ({
   companyName,
   mentor,
   livestreams,
   sparks,
}: MentorDetailPageProps) => {
   return (
      <Stack sx={styles.root}>
         <Box sx={styles.mentorDetailsContainer}>
            <BackButton />
            <MentorDetail mentor={mentor} companyName={companyName} />
         </Box>
         <Stack sx={styles.mentorContentContainer}>
            <SparksCarousel sparks={sparks} />
            <LivestreamsCarousel livestreams={livestreams} />
         </Stack>
      </Stack>
   )
}
