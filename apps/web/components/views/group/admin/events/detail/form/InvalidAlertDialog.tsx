import { sxStyles } from "@careerfairy/shared-ui"
import { Stack, SwipeableDrawer } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { Info } from "react-feather"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "./commons"
import BrandedDialog from "./views/questions/components/BrandedDialog"

const styles = sxStyles({
   paper: {
      width: "414px",
      height: "345px",
   },
   wrapContainer: {
      height: {
         xs: "320px",
         md: "100%",
      },
      padding: "28px !important",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   title: {
      fontSize: { xs: "18px", md: "20px" },
      lineHeight: "30px",
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
      lineHeight: "24px",
   },
   actions: {
      position: "absolute !important",
      width: "100%",
      display: "flex",
      justifyContent: {
         xs: "center",
         md: "space-evenly",
      },
      borderTop: "none !important",
      backgroundColor: "#FFFFFF !important",
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtnBase: {
      width: "160px",
      height: "40px",
      boxShadow: "none",
   },
   skipButton: {
      color: "white",
   },
})

const InvalidAlertContent = () => {
   const { setAlertState, handleValidationCloseDialog, tabValue, setTabValue } =
      useLivestreamCreationContext()

   const handleGoBack = () => {
      setAlertState(false)
      handleValidationCloseDialog()
   }

   const handleSkipForNow = () => {
      setAlertState(false)
      handleValidationCloseDialog()
      if (tabValue !== TAB_VALUES.JOBS) {
         setTabValue(tabValue + 1)
      }
   }

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
         withActions
      >
         <SteppedDialog.Content sx={styles.container}>
            <Stack spacing={3} sx={styles.info}>
               <Info color="#FE9B0E" size={48} />

               <SteppedDialog.Title sx={styles.title}>
                  Required fields missing
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  {
                     "Some of the fields left blank on this step are required fields. You won’t be able to publish your live stream until they are all filled."
                  }
               </SteppedDialog.Subtitle>
            </Stack>
         </SteppedDialog.Content>
         <SteppedDialog.Actions sx={styles.actions}>
            <SteppedDialog.Button
               variant="outlined"
               color="grey"
               onClick={handleGoBack}
               sx={[styles.cancelBtn, styles.actionBtnBase]}
            >
               Go back
            </SteppedDialog.Button>

            <SteppedDialog.Button
               variant="contained"
               color="warning"
               disabled={false}
               type="submit"
               onClick={handleSkipForNow}
               loading={false}
               sx={[styles.actionBtnBase, styles.skipButton]}
            >
               {"Skip for now"}
            </SteppedDialog.Button>
         </SteppedDialog.Actions>
      </SteppedDialog.Container>
   )
}

const InvalidAlertDialog = () => {
   const isMobile = useIsMobile()
   const { isValidationDialogOpen, handleValidationCloseDialog } =
      useLivestreamCreationContext()

   if (isMobile) {
      return (
         <SwipeableDrawer
            anchor="bottom"
            onClose={() => handleValidationCloseDialog()}
            onOpen={() => null}
            open={isValidationDialogOpen}
            sx={{
               ".MuiPaper-root": {
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  paddingBottom: 3,
               },
            }}
         >
            <InvalidAlertContent />
         </SwipeableDrawer>
      )
   }

   return (
      <BrandedDialog
         key="skip-validation-dialog"
         isDialogOpen={isValidationDialogOpen}
         handleCloseDialog={handleValidationCloseDialog}
         paperSx={Boolean(!isMobile) && styles.paper}
      >
         <InvalidAlertContent />
      </BrandedDialog>
   )
}

export default InvalidAlertDialog
