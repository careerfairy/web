import { Box, LinearProgress, Stack, Typography } from "@mui/material"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   title: {
      fontSize: { xs: "28px", md: "32px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   cancelBtn: {
      color: "neutral.500",
   },
   loadingWrapper: {
      alignSelf: "center",
      textAlign: "center",
      p: 2,
   },
   loading: {
      width: "200px",
   },
})

const AtsTestApplicationFallback = () => {
   const { handleClose } = useStepper()

   return (
      <>
         <SteppedDialog.Content sx={styles.container}>
            <Stack spacing={3}>
               <SteppedDialog.Title sx={styles.title}>
                  Application{" "}
                  <Box component="span" color="secondary.main">
                     test
                  </Box>
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  <Box component="span" fontWeight={"bold"}>
                     This crucial step enables Jobs to be associated with your
                     live stream.
                  </Box>
                  <Box>
                     To finalise the ATS integration, create a mock application
                     through the CareerFairy platform within your ATS system.
                     Once complete, you may discard the sample Candidate from
                     your ATS system.
                  </Box>
               </SteppedDialog.Subtitle>
               <Box sx={styles.loadingWrapper}>
                  <LinearProgress sx={styles.loading} color="secondary" />
                  <Typography variant="small" color="neutral.500">
                     Retrieving information.
                  </Typography>
               </Box>
            </Stack>
         </SteppedDialog.Content>

         <SteppedDialog.Actions>
            <SteppedDialog.Button
               variant="outlined"
               color="grey"
               onClick={handleClose}
               sx={styles.cancelBtn}
            >
               Cancel
            </SteppedDialog.Button>

            <SteppedDialog.Button
               variant="contained"
               color={"secondary"}
               disabled
            >
               Test
            </SteppedDialog.Button>
         </SteppedDialog.Actions>
      </>
   )
}

export default AtsTestApplicationFallback
