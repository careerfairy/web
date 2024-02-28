import { Box, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useAtsApplicationTest from "components/custom-hook/ats/useAtsApplicationTest"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import { sxStyles } from "types/commonTypes"
import AtsTestApplicationFallback from "./AtsTestApplicationFallback"
import CircularLoader from "components/views/loader/CircularLoader"
import JobList from "components/views/group/admin/ats-integration/application-test/JobList"
import { useCallback } from "react"
import Image from "next/legacy/image"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   wrapContainer: {
      minHeight: "400px",

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
      mt: 1,
      maxWidth: "550px !important",
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
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
      mt: "65px",
   },
   mobileLoading: {
      mt: "50% !important",
   },
})

const AtsTestApplication = () => {
   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         withActions
      >
         <SuspenseWithBoundary fallback={<AtsTestApplicationFallback />}>
            <Content />
         </SuspenseWithBoundary>
      </SteppedDialog.Container>
   )
}

const Content = () => {
   const { handleClose, goToStep } = useStepper()
   const isMobile = useIsMobile()
   const { isLoading, onSubmit, state, dispatch, actions } =
      useAtsApplicationTest({
         onSuccess: useCallback(
            () => goToStep("application-success"),
            [goToStep]
         ),
         onError: useCallback(() => goToStep("application-error"), [goToStep]),
      })

   const { selectJob } = actions
   const { readyToTest, testedSuccessfully } = state
   const isTestedCompleted =
      testedSuccessfully === false || testedSuccessfully === true

   if (isLoading || isTestedCompleted) {
      return <LoadingTest />
   }

   return (
      <>
         <SteppedDialog.Content sx={styles.container}>
            <Stack spacing={isMobile ? 4 : 3}>
               <SteppedDialog.Title sx={styles.title}>
                  Application{" "}
                  <Box component="span" color="secondary.main">
                     test
                  </Box>
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  <Stack spacing={isMobile ? 4 : 0}>
                     <Box component="span" fontWeight={"bold"}>
                        This crucial step enables Jobs to be associated with
                        your live stream.
                     </Box>

                     <Box>
                        To finalize the ATS integration, create a mock
                        application through the CareerFairy platform within your
                        ATS system. Once complete, you may discard the sample
                        Candidate from your ATS system.
                     </Box>
                  </Stack>
               </SteppedDialog.Subtitle>

               <SuspenseWithBoundary fallback={<CircularLoader />}>
                  <JobList
                     disabled={isLoading}
                     onChange={(job) => dispatch(selectJob(job))}
                     isBrandedVersion
                  />
               </SuspenseWithBoundary>

               {isMobile ? (
                  <Box>
                     <SteppedDialog.Button
                        variant="contained"
                        color={"secondary"}
                        disabled={Boolean(
                           !readyToTest || testedSuccessfully === true
                        )}
                        onClick={onSubmit}
                        fullWidth
                     >
                        Test
                     </SteppedDialog.Button>
                  </Box>
               ) : null}
            </Stack>
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
                  disabled={Boolean(
                     !readyToTest || testedSuccessfully === true
                  )}
                  onClick={onSubmit}
               >
                  Test
               </SteppedDialog.Button>
            </SteppedDialog.Actions>
         )}
      </>
   )
}

const LoadingTest = () => {
   const isMobile = useIsMobile()

   if (!isMobile) {
      return (
         <Box sx={styles.loadingWrapper}>
            <Progress />
         </Box>
      )
   }

   return (
      <SteppedDialog.Content sx={styles.container}>
         <Stack spacing={3}>
            <SteppedDialog.Title sx={styles.title}>
               Application test
            </SteppedDialog.Title>

            <Box sx={[styles.loadingWrapper, styles.mobileLoading]}>
               <Progress />
            </Box>
         </Stack>
      </SteppedDialog.Content>
   )
}

const Progress = () => (
   <>
      <Image
         src="/job-application-test-loader.gif"
         width="100"
         height="100"
         alt="Test in progress"
      />

      <Typography variant="brandedBody" color="neutral.500" mt={1}>
         Test in progress
      </Typography>
   </>
)

export default AtsTestApplication
