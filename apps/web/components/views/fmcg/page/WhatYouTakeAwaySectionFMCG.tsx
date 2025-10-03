import { Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   section: {
      gap: 2,
   },
   sectionTitle: {
      color: "text.primary",
      fontWeight: 700,
   },
   sectionDescription: {
      color: "neutral.700",
   },
})

export default function WhatYouTakeAwaySectionFMCG() {
   return (
      <Stack sx={styles.section}>
         <Typography variant="desktopBrandedH4" sx={styles.sectionTitle}>
            What you&apos;ll take away
         </Typography>
         <Typography variant="brandedBody" sx={styles.sectionDescription}>
            Join live sessions and gain valuable insights into the FMCG
            industry, from brand management to supply chain operations.
         </Typography>
      </Stack>
   )
}
