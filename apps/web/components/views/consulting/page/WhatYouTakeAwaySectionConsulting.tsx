import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { CheckIcon } from "../../panels/page/components/CheckIcon"

const styles = sxStyles({
   section: (theme) => ({
      padding: 0,
      gap: 3,
      flexDirection: "column",
      [theme.breakpoints.up("md")]: {
         flexDirection: "row",
         gap: 1.25,
         padding: 1.5,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flexDirection: "column",
         gap: 3,
      },
      [theme.breakpoints.up("lg")]: {
         flexDirection: "row",
         gap: 1.25,
      },
   }),
   sectionTitle: {
      color: "text.primary",
      fontWeight: 700,
   },
   takeawaysList: {
      gap: 2,
   },
   takeawayItem: {
      gap: 2,
      alignItems: "flex-start",
   },
   iconWrapper: {
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: "50%",
      backgroundColor: (theme) => theme.brand.purple[50],
   },
   icon: {
      width: 16,
      height: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: (theme) => theme.brand.purple[800],
      fontSize: "12px",
      fontWeight: 600,
   },
   takeawayText: {
      color: "text.primary",
   },
   imageWrapper: (theme) => ({
      alignSelf: "center",
      alignContent: "center",
      maxWidth: "375px",
      [theme.breakpoints.up("sm")]: {
         maxWidth: "548px",
      },
      [theme.breakpoints.up("md")]: {
         flex: "1 1 auto",
         maxWidth: "none",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flex: "0 0 auto",
         maxWidth: "375px",
      },
      [theme.breakpoints.up("lg")]: {
         flex: "1 1 auto",
         maxWidth: "none",
      },
   }),
   textWrapper: (theme) => ({
      flex: "1 1 auto",
      padding: "0 12px",
      justifyContent: "center",
      alignItems: "flex-start",
      alignSelf: "flex-start",
      [theme.breakpoints.up("md")]: {
         flexShrink: 1,
         alignSelf: "center",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         alignSelf: "flex-start",
      },
      [theme.breakpoints.up("lg")]: {
         alignSelf: "center",
      },
   }),
})

const takeaways = [
   "A replay link straight to your inbox",
   "Exclusive consulting case study frameworks and templates",
   "Priority access to future consulting-focused sessions",
   "Networking opportunities with consulting professionals",
]

export default function WhatYouTakeAwaySectionConsulting() {
   const isMobile = useIsMobile()

   return (
      <Stack sx={styles.section}>
         <Box sx={styles.imageWrapper}>
            <Image
               src={`/panels/take-away-${isMobile ? "mobile" : "desktop"}.png`}
               alt="What you take away - Consulting"
               width={500}
               height={500}
               style={{ width: "100%", height: "auto" }}
            />
         </Box>

         <Stack sx={styles.textWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               What do you take away?
            </Typography>

            <Stack sx={styles.takeawaysList}>
               {takeaways.map((takeaway, index) => (
                  <Stack key={index} sx={styles.takeawayItem} direction="row">
                     <Box sx={styles.iconWrapper}>
                        <Box sx={styles.icon} component={CheckIcon}></Box>
                     </Box>
                     <Typography variant="brandedBody" sx={styles.takeawayText}>
                        {takeaway}
                     </Typography>
                  </Stack>
               ))}
            </Stack>
         </Stack>
      </Stack>
   )
}