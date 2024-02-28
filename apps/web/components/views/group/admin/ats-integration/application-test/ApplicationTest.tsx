import Stack from "@mui/material/Stack"
import LoadingButton from "@mui/lab/LoadingButton"
import JobList from "./JobList"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import CircularLoader from "components/views/loader/CircularLoader"
import Typography from "@mui/material/Typography"
import useAtsApplicationTest from "components/custom-hook/ats/useAtsApplicationTest"
import { useCallback } from "react"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"

export const ApplicationTest = () => {
   const { successNotification } = useSnackbarNotifications()
   const { isLoading, components, onSubmit, state, dispatch, actions } =
      useAtsApplicationTest({
         onSuccess: useCallback(
            () => successNotification(successMessage),
            [successNotification]
         ),
      })
   const { selectJob, setData } = actions
   const { readyToTest, testedSuccessfully } = state

   return (
      <>
         <Stack spacing={2}>
            <SuspenseWithBoundary fallback={<CircularLoader />}>
               <JobList
                  disabled={isLoading}
                  onChange={(job) => dispatch(selectJob(job))}
               />
            </SuspenseWithBoundary>

            {Object.entries(components).map(([requiredField, component]) => (
               <SuspenseWithBoundary
                  fallback={<CircularLoader />}
                  key={`suspense-${requiredField}`}
               >
                  {component((value) => {
                     dispatch(setData({ [requiredField]: value }))
                  }, isLoading)}
               </SuspenseWithBoundary>
            ))}

            <LoadingButton
               variant={"contained"}
               color={"secondary"}
               disabled={!readyToTest || testedSuccessfully === true}
               loading={isLoading}
               onClick={onSubmit}
            >
               Test
            </LoadingButton>
            {testedSuccessfully === true && (
               <Typography color="green" align={"center"} p={2}>
                  {successMessage}
               </Typography>
            )}

            {testedSuccessfully === false && (
               <Typography color="error" align="center" p={2}>
                  The Test Application failed with an error. We&apos;ll analyse
                  it and will get back to you soon.
               </Typography>
            )}
         </Stack>
      </>
   )
}

const successMessage =
   "Application was successful! You can now associate jobs to livestreams and start your recruiting journey!"
