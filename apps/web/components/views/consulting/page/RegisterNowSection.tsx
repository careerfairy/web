import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import { RectangleConsultingCard } from "../cards/RectangleConsultingCard"
import { sxStyles } from "types/commonTypes"
import { SquareConsultingCard } from "../cards/SquareConsultingCard"

const styles = sxStyles({
   ctaSection: (theme) => ({
      backgroundColor: theme.brand.white[400],
      paddingX: 4,
      paddingY: 4,
      textAlign: "center",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 3,
      mx: "-16px",
      px: "16px",
      [theme.breakpoints.up("md")]: {
         flexDirection: "row",
         alignItems: "flex-start",
         paddingX: 6,
         paddingY: 6,
         textAlign: "left",
         mx: "-32px",
         px: "32px",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flexDirection: "column",
         alignItems: "center",
      },
      [theme.breakpoints.up("lg")]: {
         flexDirection: "row",
         alignItems: "flex-start",
      },
   }),
   ctaTitle: (theme) => ({
      color: "text.primary",
      fontWeight: 700,
      fontSize: "20px",
      lineHeight: "30px",
      maxWidth: "100%",
      alignItems: "flex-start",
      textAlign: "center",
      [theme.breakpoints.up("md")]: {
         alignSelf: "center",
         maxWidth: "428px",
         textAlign: "left",
         fontSize: "38px",
         lineHeight: "50px",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         alignItems: "flex-start",
         maxWidth: "100%",
         textAlign: "center",
      },
      [theme.breakpoints.up("lg")]: {
         alignSelf: "center",
         maxWidth: "428px",
         textAlign: "left",
      },
   }),
   ctaHighlight: {
      color: "primary.600",
   },
   cardsContainer: (theme) => ({
      width: "100%",
      alignItems: "center",
      maxWidth: "548px",
      gap: 1.5,
      flexGrow: 1,
      minHeight: 0,
      [theme.breakpoints.up("md")]: {
         alignItems: "unset",
      },
      "& > *": {
         flex: 1,
         minWidth: "280px",
         width: "100%",
         maxWidth: "343px",
         minHeight: "170px",
         [theme.breakpoints.up("md")]: {
            minWidth: "272px",
            maxWidth: "320px",
            minHeight: "322px",
         },
      },
   }),
})

interface RegisterNowSectionProps {
   consultingEvents: LivestreamEvent[]
   handleOpenLivestreamDialog: (livestreamId: string) => void
}

export default function RegisterNowSection({
   consultingEvents,
   handleOpenLivestreamDialog,
}: RegisterNowSectionProps) {
   const theme = useTheme()
   const isMobile = useMediaQuery(theme.breakpoints.down("md"))

   return (
      <Stack direction={{ xs: "column", md: "row" }} sx={styles.ctaSection}>
         <Typography sx={styles.ctaTitle}>
            Register now to advance your{" "}
            <Box component="span" sx={styles.ctaHighlight}>
               consulting career
            </Box>{" "}
            today!
         </Typography>

         <Stack
            direction={isMobile ? "column" : "row"}
            sx={styles.cardsContainer}
         >
            {consultingEvents.map((consulting) =>
               isMobile ? (
                  <RectangleConsultingCard
                     key={consulting.id}
                     event={consulting}
                     onCardClick={handleOpenLivestreamDialog}
                  />
               ) : (
                  <SquareConsultingCard
                     key={consulting.id}
                     event={consulting}
                     onCardClick={handleOpenLivestreamDialog}
                  />
               )
            )}
         </Stack>
      </Stack>
   )
}