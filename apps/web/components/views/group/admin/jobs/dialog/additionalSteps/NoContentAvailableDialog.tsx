import { Stack, useTheme } from "@mui/material"
import { AlertCircle } from "react-feather"
import { useFormContext } from "react-hook-form"
import { sxStyles } from "../../../../../../../types/commonTypes"
import SteppedDialog from "../../../../../stepped-dialog/SteppedDialog"

const styles = sxStyles({
   wrapContainer: {
      width: { xs: "100%", md: "450px" },
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
      fontSize: "16px",
   },
   btn: {
      width: "100%",
      color: "white",
   },
})

const NoContentAvailableDialog = () => {
   const theme = useTheme()
   const {
      formState: { isSubmitting },
   } = useFormContext()

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <Stack spacing={3} sx={styles.info}>
                  <AlertCircle color={theme.palette.warning.main} size={48} />

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
                     sx={styles.subtitle}
                  >
                     No worries, this job opening has been saved.
                  </SteppedDialog.Subtitle>

                  <SteppedDialog.Button
                     type={"submit"}
                     form="custom-job-form"
                     variant="contained"
                     color={"warning"}
                     loading={isSubmitting}
                     disabled={isSubmitting}
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

export default NoContentAvailableDialog
