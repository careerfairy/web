import { Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { useHasLivestreamStarted } from "./useLivestreamHasStarted"

const styles = sxStyles({
   root: {
      mt: 3,
      mb: 4,
   },
})

export const StatusTitle = () => {
   const streamIsMobile = useStreamIsMobile()

   const hasLivestreamStarted = useHasLivestreamStarted()

   return (
      <Typography
         sx={styles.root}
         variant={streamIsMobile ? "mobileBrandedH2" : "desktopBrandedH1"}
         fontWeight={streamIsMobile ? 700 : 600}
         maxWidth={streamIsMobile ? "auto" : 848}
         px={streamIsMobile ? 2 : 0}
         textAlign="center"
      >
         {hasLivestreamStarted
            ? "Don’t panic, the hosts are getting ready! They will welcome you in few seconds."
            : "The live stream is about to start!"}
      </Typography>
   )
}
