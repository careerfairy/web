import { Box, Stack, useTheme } from "@mui/material"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { sxStyles } from "types/commonTypes"
import { XCircle as ErrorIcon } from "react-feather"
import useAtsApplicationTest from "components/custom-hook/ats/useAtsApplicationTest"
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
   cancelBtn: {
      color: "neutral.500",
   },
   mobileContent: {
      display: "flex",
      marginTop: " 40% !important",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
   },
   mobileBtn: {
      mt: 3,
   },
})

const ApplicationTestError = () => {
   const { handleClose } = useStepper()
   const { isLoading, onSubmit } = useAtsApplicationTest()
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
                           onClick={onSubmit}
                           loading={isLoading}
                           sx={styles.mobileBtn}
                        >
                           Try again
                        </SteppedDialog.Button>

                        <SteppedDialog.Button
                           variant="outlined"
                           color="grey"
                           onClick={handleClose}
                           sx={[styles.cancelBtn, styles.mobileBtn]}
                        >
                           Close
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
                     onClick={onSubmit}
                     loading={isLoading}
                  >
                     Try again
                  </SteppedDialog.Button>
               </SteppedDialog.Actions>
            )}
         </>
      </SteppedDialog.Container>
   )
}

const Content = () => {
   const theme = useTheme()

   return (
      <Stack spacing={3}>
         <ErrorIcon color={theme.palette.error.main} />

         <SteppedDialog.Title sx={styles.title}>
            Application test got an{" "}
            <Box component="span" color="error.main">
               error
            </Box>
            !
         </SteppedDialog.Title>

         <SteppedDialog.Subtitle sx={styles.subtitle}>
            Oops! The application test encountered an error. Check your inputs
            and configurations. If the issue persists, contact support for
            assistance.
         </SteppedDialog.Subtitle>
      </Stack>
   )
}

export default ApplicationTestError
