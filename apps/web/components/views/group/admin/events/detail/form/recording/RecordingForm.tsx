import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import { RecordingBannerUploader } from "./RecordingBannerUploader"
import {
   RecordingCategoriesFields,
   RecordingFormFields,
} from "./RecordingFormFields"
import { useRecordingFormContext } from "./RecordingFormProvider"
import { RecordingPlayer } from "./RecordingPlayer"
import { RecordingRightPanel } from "./RecordingRightPanel"

const styles = sxStyles({
   container: {
      marginX: { xs: 1.5, md: 4 },
      mb: { xs: 2, md: 4 },
   },
   sectionContainer: {
      borderRadius: "12px",
      backgroundColor: (theme) => theme.brand.white[200],
   },
   contentWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: { xs: 2, md: 2 },
      alignItems: "flex-start",
   },
   mainContent: {
      flex: 1,
      minWidth: 0,
      width: "100%",
   },
   rightPanelContainer: {
      p: 1,
      height: { xs: "auto", md: "80vh" },
      width: { xs: "100%", md: "33.333%" },
      position: { xs: "relative", md: "sticky" },
      top: { xs: "auto", md: "75px" }, // account for top bar
      alignSelf: { xs: "stretch", md: "flex-start" },
   },
})

export const RecordingForm = () => {
   const isMobile = useIsMobile()
   const { livestream } = useRecordingFormContext()
   return (
      <Box sx={styles.container}>
         <Stack rowGap={2}>
            <Box sx={styles.contentWrapper}>
               <Box sx={styles.mainContent}>
                  <Stack gap={{ xs: 1, md: 1.5 }}>
                     <Box sx={styles.sectionContainer} p={1.5}>
                        <RecordingPlayer />
                     </Box>
                     {!isMobile ? (
                        <RecordingDesktopForm />
                     ) : (
                        <Box sx={styles.sectionContainer} p={1.5}>
                           <Typography
                              variant="brandedBody"
                              fontWeight={600}
                              color="neutral.800"
                           >
                              {livestream.title}
                           </Typography>
                        </Box>
                     )}
                  </Stack>
               </Box>
               <Box sx={[styles.sectionContainer, styles.rightPanelContainer]}>
                  <RecordingRightPanel />
               </Box>
            </Box>
         </Stack>
      </Box>
   )
}

const RecordingDesktopForm = () => {
   return (
      <>
         <Box sx={styles.sectionContainer} p={1.5}>
            <RecordingFormFields />
         </Box>

         <Box sx={styles.sectionContainer} p={1.5}>
            <RecordingBannerUploader />
         </Box>
         <Box sx={styles.sectionContainer} p={1.5}>
            <RecordingCategoriesFields />
         </Box>
      </>
   )
}
