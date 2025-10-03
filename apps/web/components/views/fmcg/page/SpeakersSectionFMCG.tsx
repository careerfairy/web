import { Group } from "@careerfairy/shared-lib/groups"
import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Box, Grid, Stack, Typography } from "@mui/material"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import SpeakerCard from "../../panels/page/components/SpeakerCard"

const styles = sxStyles({
   section: (theme) => ({
      gap: 4,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      [theme.breakpoints.up("md")]: {
         flexDirection: "row",
         alignItems: "flex-start",
         padding: theme.spacing(3),
         gap: 6,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flexDirection: "column",
      },
      [theme.breakpoints.up("lg")]: {
         flexDirection: "row",
         alignItems: "flex-start",
      },
   }),
   sectionTitleWrapper: (theme) => ({
      flex: "1 0 0",
      alignSelf: "center",
      zIndex: 1,
      [theme.breakpoints.up("md")]: {
         order: 1,
         flexShrink: 0,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         order: 1,
      },
      [theme.breakpoints.up("lg")]: {
         order: 1,
      },
   }),
   sectionTitle: {
      color: "text.primary",
      fontWeight: 700,
      alignContent: "center",
   },
   sectionDescription: {
      color: "neutral.700",
      alignContent: "center",
   },
   speakersWrapper: (theme) => ({
      maxWidth: "375px",
      alignSelf: "center",
      justifyContent: "center",
      position: "relative", // Enable absolute positioning for visual support
      zIndex: 1, // Ensure speakers are above visual support
      [theme.breakpoints.up("sm")]: {
         maxWidth: "548px",
      },
      [theme.breakpoints.up("md")]: {
         order: 2,
         flex: "1 1 auto",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         order: 2,
         flex: "0 0 auto",
      },
      [theme.breakpoints.up("lg")]: {
         order: 2,
         flex: "1 1 auto",
      },
   }),
   speakerCard: {
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
   },
   // Visual support container - positioned absolutely behind speakers grid
   visualSupportContainer: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
   },
   // Top left of speakers grid
   visualSupportLeft: {
      position: "absolute",
      left: 0,
      top: 0,
      margin: "-10px -15px",
      "&::before": {
         content: '""',
         position: "absolute",
         inset: 0,
         background: "linear-gradient(135deg, #F4FFE1 0%, rgba(244, 255, 225, 0) 100%)",
         mixBlendMode: "multiply",
         pointerEvents: "none",
      },
   },
   // Bottom right of speakers grid
   visualSupportRight: {
      position: "absolute",
      right: 0,
      bottom: 0,
      margin: "-5px",
      "&::before": {
         content: '""',
         position: "absolute",
         inset: 0,
         background: "linear-gradient(135deg, #FFF8E1 0%, rgba(255, 248, 225, 0) 100%)",
         mixBlendMode: "multiply",
         pointerEvents: "none",
      },
   },
})

interface SpeakersSectionFMCGProps {
   speakers: Speaker[]
   companies: Group[]
}

export default function SpeakersSectionFMCG({
   speakers,
   companies,
}: SpeakersSectionFMCGProps) {
   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.sectionTitleWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               Meet our FMCG experts!
            </Typography>

            <Typography variant="brandedBody" sx={styles.sectionDescription}>
               Connect with experienced professionals from leading consumer
               goods companies who have built successful careers in FMCG. Learn
               from their experiences, get insider tips on interviews, and
               discover what it really takes to thrive in the industry.
            </Typography>
         </Stack>

         {speakers?.length > 0 && (
            <Box sx={styles.speakersWrapper}>
               {/* Visual support images - positioned absolutely behind speakers grid */}
               <Box aria-hidden sx={styles.visualSupportContainer}>
                  <Box aria-hidden sx={styles.visualSupportLeft}>
                     <Image
                        src="/panels/speakers-purple-visual-support.svg"
                        alt=""
                        width={237}
                        height={199}
                        priority
                     />
                  </Box>
                  <Box aria-hidden sx={styles.visualSupportRight}>
                     <Image
                        src="/panels/speakers-turquoise-visual-support.svg"
                        alt=""
                        width={339}
                        height={199}
                        priority
                     />
                  </Box>
               </Box>

               <Grid
                  container
                  spacing={1}
                  sx={{ position: "relative", zIndex: 1 }}
               >
                  {speakers.map((speaker, speakerIndex) => {
                     const company = companies.find(
                        (company) => company.id === speaker.groupId
                     )
                     return (
                        <Grid
                           item
                           xs={6}
                           sm={4}
                           key={speakerIndex}
                           sx={styles.speakerCard}
                        >
                           <SpeakerCard
                              speaker={speaker}
                              company={company}
                              rootSx={styles.speakerCard}
                           />
                        </Grid>
                     )
                  })}
               </Grid>
            </Box>
         )}
      </Stack>
   )
}
