import { Box, Stack, Typography } from "@mui/material"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import Image from "next/image"
import { sxStyles } from "types/commonTypes"
import { BombIcon } from "../../panels/page/components/BombIcon"
import { CapIcon } from "../../panels/page/components/CapIcon"
import { PinIcon } from "../../panels/page/components/PinIcon"

const styles = sxStyles({
   section: (theme) => ({
      display: "flex",
      gap: 4,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: 0,
      borderRadius: "24px",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      [theme.breakpoints.up("md")]: {
         flexDirection: "row",
         padding: 3,
         gap: 6,
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         flexDirection: "column",
      },
      [theme.breakpoints.up("lg")]: {
         flexDirection: "row",
      },
   }),
   textWrapper: (theme) => ({
      alignSelf: "flex-start",
      flex: "1 1 auto",
      [theme.breakpoints.up("md")]: {
         alignSelf: "center",
      },
      [theme.breakpoints.up("sparksFullscreen")]: {
         alignSelf: "flex-start",
      },
      [theme.breakpoints.up("lg")]: {
         alignSelf: "center",
      },
   }),
   iconWrapper: {
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderRadius: "50%",
      backgroundColor: "#FFF8E1",
   },
   icon: {
      width: 16,
      height: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#E29313",
      fontWeight: 600,
   },
   sectionTitle: {
      color: "text.primary",
      fontWeight: 700,
   },
   sectionDescription: {
      color: "neutral.700",
   },
   targetAudienceList: {
      gap: 2,
   },
   targetAudienceItem: {
      gap: 2,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      alignSelf: "stretch",
      width: "100%",
   },
   imageContainer: (theme) => ({
      alignSelf: "center",
      alignContent: "center",
      minWidth: "300px",
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
})

export default function WhosThisForSectionFMCG() {
   const targetAudience = [
      {
         text: "You're a student or graduate interested in FMCG",
         icon: CapIcon,
      },
      {
         text: "You're preparing for interviews with consumer goods companies",
         icon: JobsIcon,
      },
      {
         text: "Curious about marketing, brand management, or supply chain roles",
         icon: BombIcon,
      },
      {
         text: "You are wondering if FMCG is right for you",
         icon: PinIcon,
      },
   ]

   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.textWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               Who&apos;s this for?
            </Typography>

            <Stack sx={styles.targetAudienceList}>
               {targetAudience.map((audience, index) => (
                  <Stack
                     key={index}
                     direction="row"
                     sx={styles.targetAudienceItem}
                  >
                     <Box sx={styles.iconWrapper}>
                        <Box
                           sx={styles.icon}
                           component={audience.icon}
                           strokeWidth="2.25"
                        ></Box>
                     </Box>
                     <Typography
                        variant="brandedBody"
                        sx={styles.sectionDescription}
                     >
                        {audience.text}
                     </Typography>
                  </Stack>
               ))}
            </Stack>
         </Stack>

         <Box sx={styles.imageContainer}>
            <Image
               src="/panels/whos-this-for.png"
               alt="Whos this for section - FMCG"
               width={500}
               height={300}
               style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "16px",
               }}
            />
         </Box>
      </Stack>
   )
}
