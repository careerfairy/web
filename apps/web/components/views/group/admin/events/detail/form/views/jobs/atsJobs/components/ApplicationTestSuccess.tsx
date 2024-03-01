import { Box, Stack } from "@mui/material"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { sxStyles } from "types/commonTypes"
import { CheckCircleRounded as SuccessIcon } from "@mui/icons-material"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   wrapContainer: {
      height: {
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,

      "& svg": {
         alignSelf: "center",
         width: 64,
         height: 64,
      },
   },
   content: {
      mt: 1,
      maxWidth: "550px !important",
   },
   title: {
      fontSize: { xs: "20px", md: "24px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   mobileContent: {
      display: "flex",
      marginTop: " 50% !important",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
   },
   mobileDoneBtn: {
      mt: 3,
      width: "120px",
   },
})

const ApplicationTestGenerated = () => {
   const { handleClose } = useStepper()
   const isMobile = useIsMobile()

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               {isMobile ? (
                  <>
                     <SteppedDialog.Title sx={styles.title}>
                        Application test
                     </SteppedDialog.Title>

                     <Box sx={styles.mobileContent}>
                        <Content />

                        <SteppedDialog.Button
                           variant="contained"
                           color={"secondary"}
                           onClick={handleClose}
                           sx={styles.mobileDoneBtn}
                        >
                           Done
                        </SteppedDialog.Button>
                     </Box>
                  </>
               ) : (
                  <Content />
               )}
            </SteppedDialog.Content>

            {isMobile ? null : (
               <SteppedDialog.Actions>
                  <SteppedDialog.Button
                     variant="contained"
                     color={"secondary"}
                     onClick={handleClose}
                  >
                     Done
                  </SteppedDialog.Button>
               </SteppedDialog.Actions>
            )}
         </>
      </SteppedDialog.Container>
   )
}

const Content = () => (
   <Stack spacing={3}>
      <SuccessIcon color="success" />

      <SteppedDialog.Title sx={styles.title}>
         Application test was{" "}
         <Box component="span" color="success.main">
            successful
         </Box>
         !
      </SteppedDialog.Title>

      <SteppedDialog.Subtitle sx={styles.subtitle}>
         You can now associate jobs to live streams and start your recruiting
         journey!
      </SteppedDialog.Subtitle>
   </Stack>
)

export default ApplicationTestGenerated
