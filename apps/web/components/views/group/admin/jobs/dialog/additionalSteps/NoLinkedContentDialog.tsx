import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { AlertTriangle } from "react-feather"
import { useFormContext } from "react-hook-form"

const styles = sxStyles({
   wrapContainer: {
      width: "450px",
      height: {
         xs: "310px",
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      px: 2,
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   title: {
      fontSize: "20px !important",
   },
   subtitle: {
      fontSize: "16px ",
   },
   btn: {
      width: "100%",
   },
   mobileDialog: {
      top: "calc(100dvh - 310px)",
   },
   actions: {
      border: "none !important",
   },
})

const NoLinkContentDialog = () => {
   const isMobile = useIsMobile()
   const {
      formState: { isSubmitting },
   } = useFormContext()
   const { moveToPrev } = useStepper()

   const dialogElement: HTMLElement = document.querySelector('[role="dialog"]')

   if (dialogElement) {
      dialogElement.style.top = isMobile
         ? styles.mobileDialog.top
         : "revert-layer"
   }

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Stack spacing={2} sx={styles.info}>
                  <AlertTriangle color={"#856DEE"} size={48} />

                  <SteppedDialog.Title sx={styles.title}>
                     Make your job visible!
                  </SteppedDialog.Title>

                  <SteppedDialog.Subtitle
                     maxWidth={"unset"}
                     textAlign={"center"}
                     sx={styles.subtitle}
                  >
                     Linking your job opening to Sparks or upcoming live streams
                     is necessary for qualified candidates to see it.
                  </SteppedDialog.Subtitle>
               </Stack>
            </SteppedDialog.Content>

            <SteppedDialog.Actions sx={styles.actions}>
               <SteppedDialog.Button
                  type="submit"
                  form="custom-job-form"
                  variant="outlined"
                  color={"grey"}
                  sx={styles.btn}
                  loading={isSubmitting}
                  disabled={isSubmitting}
               >
                  I&apos;ll do it later
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  variant="contained"
                  color={"secondary"}
                  sx={styles.btn}
                  onClick={moveToPrev}
               >
                  Link content
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default NoLinkContentDialog
