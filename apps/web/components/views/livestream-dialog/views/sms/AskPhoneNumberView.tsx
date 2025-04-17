import { LoadingButton } from "@mui/lab"
import { Box, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { userRepo } from "data/RepositoryInstances"
import { MuiTelInput, matchIsValidTel } from "mui-tel-input"
import { Controller, useForm } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"

const styles = sxStyles({
   fullHeight: {
      height: "100%",
   },
   fullWidth: {
      width: "100%",
   },
   container: {
      height: "100%",
      display: "flex",
      alignItems: "center",
   },
   contentWrapper: {
      width: {
         xs: "100%",
         md: "70%",
      },
      margin: "0 auto",
   },
})

const AskPhoneNumberView = () => {
   const firebase = useFirebaseService()
   const { userData } = useAuth()
   const { goToView, livestream, handleDiscoverCompanySparks } =
      useLiveStreamDialog()
   const { errorNotification, successNotification } = useSnackbarNotifications()

   const onSubmit = async (data: { phoneNumber: string }) => {
      try {
         await Promise.all([
            userRepo.updateAdditionalInformation(userData.id, {
               phoneNumber: data.phoneNumber,
            }),
            firebase.updateLivestreamUserPhoneNumber(
               livestream.id,
               userData.userEmail,
               data.phoneNumber
            ),
         ])
         successNotification("We will remind you about this livestream!")
         handleDiscoverCompanySparks()
         goToView("recommendations")
      } catch (error) {
         errorNotification(
            error,
            "We encountered a problem while saving your reminder. Rest assured, we're on it!"
         )
      }
   }

   const formMethods = useForm({
      defaultValues: {
         phoneNumber: userData.phoneNumber || "",
      },
      mode: "onChange", // Important for the form to be validated on change, depending on your use case
   })

   return (
      <BaseDialogView
         sx={styles.fullHeight}
         mainContent={
            <MainContent
               onBackClick={() => goToView("recommendations")}
               onBackPosition="top-left"
               sx={styles.fullHeight}
            >
               <Box sx={styles.container}>
                  <form
                     onSubmit={formMethods.handleSubmit(onSubmit)}
                     style={styles.fullWidth}
                  >
                     <Stack
                        gap="64px"
                        alignItems="center"
                        sx={styles.contentWrapper}
                     >
                        <Stack gap="24px">
                           <Stack>
                              <Typography variant="brandedH2" fontWeight={600}>
                                 What’s your phone number?
                              </Typography>
                              <Typography variant="brandedBody">
                                 We will only send you reminders about this live
                                 stream. After the live stream your phone number
                                 will be deleted. You <b>won{"’"}t</b> receive
                                 any other texts.
                              </Typography>
                           </Stack>
                           <Stack direction="row" gap="4px">
                              <Controller
                                 name="phoneNumber"
                                 control={formMethods.control}
                                 rules={{
                                    validate: (value) =>
                                       matchIsValidTel(value, {
                                          onlyCountries: [
                                             "GB",
                                             "CH",
                                             "DE",
                                             "NL",
                                          ],
                                       }),
                                 }}
                                 render={({
                                    field: {
                                       ref: fieldRef,
                                       value,
                                       ...fieldProps
                                    },
                                    fieldState,
                                 }) => (
                                    <MuiTelInput
                                       {...fieldProps}
                                       value={value ?? ""}
                                       inputRef={fieldRef}
                                       onlyCountries={["GB", "CH", "DE", "NL"]}
                                       helperText={
                                          fieldState.invalid
                                             ? "Insert a valid phone number"
                                             : ""
                                       }
                                       error={fieldState.invalid}
                                       fullWidth
                                    />
                                 )}
                              />
                           </Stack>
                        </Stack>
                        <LoadingButton
                           loading={formMethods.formState.isSubmitting}
                           onClick={() => formMethods.handleSubmit(onSubmit)()}
                           variant="contained"
                           size="large"
                           color="primary"
                           fullWidth
                           disabled={!formMethods.formState.isDirty}
                        >
                           {formMethods.formState.isSubmitting
                              ? "Updating"
                              : "Get Reminder"}
                        </LoadingButton>
                     </Stack>
                  </form>
               </Box>
            </MainContent>
         }
      />
   )
}

export default AskPhoneNumberView
