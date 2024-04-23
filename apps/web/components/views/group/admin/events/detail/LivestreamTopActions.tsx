import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useLivestreamCreationContext } from "components/views/group/admin/events/detail/LivestreamCreationContext"
import InvalidAlertTooltip from "components/views/group/admin/events/detail/form/InvalidAlertTooltip"
import { useEffect, useState } from "react"
import { RefreshCw, Save } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLivestreamAutoSaveContext } from "./LivestreamAutoSaveContext"
import { PublishButton } from "./PublishButton"

const ICON_SIZE = 18

const styles = sxStyles({
   wrapper: {
      color: (theme) => theme.brand.info.main,
      textAlign: "center",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
      gap: 1,
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
   },
   spinningAnimation: {
      height: ICON_SIZE,
      "@keyframes spin": {
         "0%": { transform: "rotate(0deg)" },
         "100%": { transform: "rotate(360deg)" },
      },
      animation: "spin 1s linear infinite",
   },
})

export const LivestreamTopActions = () => {
   const isMobile = useIsMobile()
   const { shouldShowAlertIndicator, livestream } =
      useLivestreamCreationContext()
   const { isAutoSaving } = useLivestreamAutoSaveContext()

   const [hasAutoSaved, setHasAutoSaved] = useState(false)

   useEffect(() => {
      if (!hasAutoSaved && isAutoSaving) {
         setHasAutoSaved(true)
      }
   }, [isAutoSaving, hasAutoSaved])

   return (
      <Stack direction="row" spacing={3} alignItems="center">
         {Boolean(isAutoSaving) && (
            <Box sx={styles.wrapper}>
               <Box sx={styles.spinningAnimation}>
                  <RefreshCw size={ICON_SIZE} />
               </Box>
               {Boolean(!isMobile) && (
                  <Typography>Saving changes...</Typography>
               )}
            </Box>
         )}

         {Boolean(hasAutoSaved && !isAutoSaving && livestream.isDraft) && (
            <Box sx={styles.wrapper}>
               <Save size={ICON_SIZE} />
               {Boolean(!isMobile) && <Typography>Draft saved</Typography>}
            </Box>
         )}

         {Boolean(hasAutoSaved && !isAutoSaving && !livestream.isDraft) && (
            <Box sx={styles.wrapper}>
               <Save size={ICON_SIZE} />
               {Boolean(!isMobile) && <Typography>Changes saved</Typography>}
            </Box>
         )}

         {Boolean(!isMobile) && <PublishButton />}

         {Boolean(shouldShowAlertIndicator) && <InvalidAlertTooltip />}
      </Stack>
   )
}
