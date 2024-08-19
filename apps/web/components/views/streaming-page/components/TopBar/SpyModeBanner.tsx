import { Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SpyIcon } from "components/views/streaming-page/components/TopBar/SpyIcon"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      bgcolor: (theme) => theme.brand.info[600],
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
      color: "white",
   },
   rootMobile: {
      display: "flex",
      padding: "8px",
      borderRadius: "3px",
   },
   rootDesktop: {
      display: "inline-flex",
      padding: "8px 20px",
      borderRadius: "0px 0px 16px 16px",
      alignSelf: "center",
      position: "absolute",
   },
   text: {
      fontSize: "16px",
      fontWeight: 400,
   },
   icon: {
      height: "17px",
   },
})

export const SpyModeBanner = () => {
   const isMobile = useIsMobile()
   return (
      <Stack
         direction="row"
         sx={[styles.root, isMobile ? styles.rootMobile : styles.rootDesktop]}
      >
         <SpyIcon sx={styles.icon} enabled />
         {!isMobile && (
            <Typography variant="brandedBody" sx={styles.text}>
               Spy mode active
            </Typography>
         )}
      </Stack>
   )
}
