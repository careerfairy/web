import { Group } from "@careerfairy/shared-lib/groups"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack } from "@mui/material"
import { BackButton } from "./BackButton"
import { MentorDetailLayout } from "./MentorDetailLayout"

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
      padding: {
         xs: "16px",
      },
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
            <MentorDetailLayout>
               <MentorDetailLayout.Header mentor={mentor} group={group} />
               <MentorDetailLayout.Description
                  mentor={mentor}
                  group={group}
                  hasJobs={hasJobs}
                  numLivestreams={livestreams.length}
                  numSparks={sparks.length}
               />
            </MentorDetailLayout>
         </Box>
         <MentorDetailLayout.Content
            livestreams={livestreams}
            sparks={sparks}
            sx={styles.mentorContentContainer}
         />
      </Stack>
   )
}
