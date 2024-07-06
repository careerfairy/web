import { Box } from "@mui/material"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { useFormContext } from "react-hook-form"
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
   content: {
      mt: 1,
   },
   wrapperContainer: {
      height: { xs: "80dvh", md: "auto !important" },
      maxHeight: "800px",
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
})

const JobFormPreview = () => {
   const { moveToPrev } = useStepper()

   const {
      formState: { isSubmitting },
   } = useFormContext()

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapperContainer}
         withActions
      >
         <>
            <SteppedDialog.Content sx={styles.container}>
               <SteppedDialog.Title sx={styles.title}>
                  Review your{" "}
                  <Box component="span" color="secondary.main">
                     job details
                  </Box>
               </SteppedDialog.Title>
               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  You&apos;re almost there! Just make sure that everything is on
                  place
               </SteppedDialog.Subtitle>

               <Box>PREVIEW CONTENT HERE for job</Box>
            </SteppedDialog.Content>

            <SteppedDialog.Actions>
               <SteppedDialog.Button
                  variant="outlined"
                  color="grey"
                  onClick={moveToPrev}
                  sx={styles.cancelBtn}
               >
                  Back
               </SteppedDialog.Button>

               <SteppedDialog.Button
                  type="submit"
                  form="custom-job-form"
                  variant="contained"
                  color="secondary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
               >
                  Publish job
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         </>
      </SteppedDialog.Container>
   )
}

export default JobFormPreview
