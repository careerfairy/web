import { Group } from "@careerfairy/shared-lib/groups"
import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { Box, Grid, Stack, Typography } from "@mui/material"
import Image from "next/image"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import SpeakerCard from "./components/SpeakerCard"

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
         order: 2,
         flexShrink: 0,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         order: 1,
      },
      [theme.breakpoints.up("lg")]: {
         order: 2,
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
         order: 1,
         flex: "1 1 auto",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         order: 2,
         flex: "0 0 auto",
      },
      [theme.breakpoints.up("lg")]: {
         order: 1,
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
   // Turquoise image - top left of speakers grid
   visualSupportLeft: {
      position: "absolute",
      left: 0,
      top: 0,
      margin: "-10px -15px",
   },
   // Purple image - bottom right of speakers grid
   visualSupportRight: {
      position: "absolute",
      right: 0,
      bottom: 0,
      margin: "-5px",
   },
})

interface SpeakersSectionProps {
   speakers: Speaker[]
   companies: Group[]
   variant?: "panels" | "consulting"
}

// Utility function to shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
   const shuffled = [...array]
   for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
   }
   return shuffled
}

export default function SpeakersSection({
   speakers,
   companies,
   variant = "panels",
}: SpeakersSectionProps) {
   // For consulting variant, randomly select and shuffle 6 speakers
   const displayedSpeakers = useMemo(() => {
      if (variant === "consulting") {
         // First shuffle all speakers, then take the first 6
         const shuffledSpeakers = shuffleArray(speakers)
         return shuffledSpeakers.slice(0, 6)
      }
      return speakers
   }, [speakers, variant])
   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.sectionTitleWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               Meet our speakers!
            </Typography>

            <Typography variant="brandedBody" sx={styles.sectionDescription}>
               Meet real people who sat where you are just a few years ago. Now
               they&apos;ve landed their dream roles and are hiring the next
               generation. Ask them anything about how they got there and what
               really helped them stand out.
            </Typography>
         </Stack>

         {displayedSpeakers?.length > 0 && (
            <Box sx={styles.speakersWrapper}>
               {/* Visual support images - positioned absolutely behind speakers grid */}
               <Box aria-hidden sx={styles.visualSupportContainer}>
                  <Box aria-hidden sx={styles.visualSupportLeft}>
                     <Image
                        src="/panels/speakers-turquoise-visual-support.svg"
                        alt=""
                        width={237}
                        height={199}
                        priority
                     />
                  </Box>
                  <Box aria-hidden sx={styles.visualSupportRight}>
                     <Image
                        src="/panels/speakers-purple-visual-support.svg"
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
                  {displayedSpeakers.map((speaker, speakerIndex) => {
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
