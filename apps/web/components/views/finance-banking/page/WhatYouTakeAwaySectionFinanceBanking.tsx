import { Box, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   section: {
      gap: 4,
      padding: { xs: 2, md: 4 },
   },
   sectionTitle: {
      color: "text.primary",
      fontWeight: 700,
   },
   sectionDescription: {
      color: "neutral.700",
   },
})

export default function WhatYouTakeAwaySectionFinanceBanking() {
   return (
      <Stack sx={styles.section}>
         <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
            What you&apos;ll take away
         </Typography>
         <Typography variant="brandedBody" sx={styles.sectionDescription}>
            Practical insights into finance and banking careers, from interview
            preparation to understanding different roles and career paths in the
            financial sector.
         </Typography>
      </Stack>
   )
}
