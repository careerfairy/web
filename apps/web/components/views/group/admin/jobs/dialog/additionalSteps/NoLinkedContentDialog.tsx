import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { AlertCircle } from "react-feather"
import { JobDialogStepEnum } from ".."
import { sxStyles } from "../../../../../../../types/commonTypes"
import SteppedDialog, {
   useStepper,
} from "../../../../../stepped-dialog/SteppedDialog"

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
   },
   content: {
      my: { xs: 1, md: "40px" },
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   title: {
      fontSize: { xs: "20px", md: "24px" },
   },
   btn: {
      mt: 4,
      width: "350px",
   },
   mobileDialog: {
      top: "calc(100dvh - 500px)",
   },
})

const NoLinkedContentDialog = () => {
   const { handleClose, currentStep } = useStepper()
   const isMobile = useIsMobile()

   const dialogElement: HTMLElement = document.querySelector('[role="dialog"]')

   if (dialogElement) {
      dialogElement.style.top =
         isMobile && currentStep === JobDialogStepEnum.NO_LINKED_CONTENT
            ? styles.mobileDialog.top
            : "revert-layer"
   }

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Stack spacing={3} sx={styles.info}>
                  <AlertCircle color={"#FE9B0E"} size={68} />

                  <SteppedDialog.Title sx={styles.title}>
                     No content to link available
                  </SteppedDialog.Title>

                  <SteppedDialog.Subtitle
                     maxWidth={"unset"}
                     textAlign={"center"}
                  >
                     Without an upcoming live stream or published Sparks to link
                     to, your job opening won&apos;t be visible to talent.
                     Create new content and link it to this job to make it
                     visible.
                  </SteppedDialog.Subtitle>

                  <SteppedDialog.Subtitle
                     maxWidth={"unset"}
                     textAlign={"center"}
                  >
                     No worries, this job opening has been saved.
                  </SteppedDialog.Subtitle>

                  <SteppedDialog.Button
                     variant="contained"
                     color={"warning"}
                     type="submit"
                     onClick={() => handleClose()}
                     sx={styles.btn}
                  >
                     Understood
                  </SteppedDialog.Button>
               </Stack>
            </SteppedDialog.Content>
         </>
      </SteppedDialog.Container>
   )
}

export default NoLinkedContentDialog
