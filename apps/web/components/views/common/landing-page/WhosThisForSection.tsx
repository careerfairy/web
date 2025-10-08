import { Box, Stack, SxProps, Theme, Typography } from "@mui/material"
import Image from "next/image"
import { ComponentType } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

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
         padding: theme.spacing(3),
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
   },
   icon: {
      width: 16,
      height: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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

export interface TargetAudienceItem {
   text: string
   icon: ComponentType<any>
}

export interface WhosThisForSectionConfig {
   title: string
   targetAudience: TargetAudienceItem[]
   imageUrl: string
   imageAlt: string
   iconWrapperSx: SxProps<Theme>
   iconSx: SxProps<Theme>
}

interface WhosThisForSectionProps {
   config: WhosThisForSectionConfig
}

export default function WhosThisForSection({
   config,
}: WhosThisForSectionProps) {
   return (
      <Stack sx={styles.section}>
         <Stack sx={styles.textWrapper} spacing={1.5}>
            <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
               {config.title}
            </Typography>

            <Stack sx={styles.targetAudienceList}>
               {config.targetAudience.map((audience, index) => (
                  <Stack
                     key={index}
                     direction="row"
                     sx={styles.targetAudienceItem}
                  >
                     <Box
                        sx={combineStyles(
                           styles.iconWrapper,
                           config.iconWrapperSx
                        )}
                     >
                        <Box
                           sx={combineStyles(styles.icon, config.iconSx)}
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
               src={config.imageUrl}
               alt={config.imageAlt}
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
