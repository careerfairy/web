import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack, Typography } from "@mui/material"
import SparksCarousel from "../admin/sparks/general-sparks-view/SparksCarousel"
import EventsPreviewCarousel, {
   EventsTypes,
} from "../portal/events-preview/EventsPreviewCarousel"
import { BackButton } from "./BackButton"
import { MentorDetail } from "./MentorDetail"

const styles = sxStyles({
   root: {
      flexDirection: "row",
      gap: "16px",
      marginLeft: "32px",
   },
   mentorDetailsContainer: {
      position: "relative",
      display: "flex",
      width: "368px",
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
      flexDirection: "column",
      gap: "24px",
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
            <Typography variant="h6">My Sparks</Typography>
            <SparksCarousel sparks={sparks} />
            <EventsPreviewCarousel
               title="My live streams"
               events={livestreams}
               type={EventsTypes.RECOMMENDED}
            />
         </Stack>
      </Stack>
   )
}
