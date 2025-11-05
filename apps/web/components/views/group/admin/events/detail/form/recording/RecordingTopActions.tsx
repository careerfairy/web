import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useEffect, useState } from "react"
import { RefreshCw, Save } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useRecordingAutoSaveContext } from "./RecordingAutoSaveContext"

const ICON_SIZE = 18

const styles = sxStyles({
   wrapper: {
      color: (theme) => theme.brand.info.main,
      textAlign: "center",
      fontSize: "16px",
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

export const RecordingTopActions = () => {
   const isMobile = useIsMobile()
   const { isAutoSaving } = useRecordingAutoSaveContext()

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

         {Boolean(hasAutoSaved && !isAutoSaving) && (
            <Box sx={styles.wrapper}>
               <Save size={ICON_SIZE} />
               {Boolean(!isMobile) && <Typography>Saved</Typography>}
            </Box>
         )}
      </Stack>
   )
}
