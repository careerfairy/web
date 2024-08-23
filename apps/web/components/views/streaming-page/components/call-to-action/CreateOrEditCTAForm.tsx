import {
   LivestreamCTA,
   baseCTAShape,
} from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Button, Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { livestreamService } from "data/firebase/LivestreamService"
import { forwardRef } from "react"
import { FormProvider, SubmitHandler } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   form: (theme) => ({
      width: "100%",
      p: 1.5,
      borderRadius: "12px",
      border: "1px solid",
      borderColor: theme.brand.white[500],
      backgroundColor: theme.brand.white[100],
   }),
})

type Props = {
   onSuccess?: () => void
   onCancel?: () => void
   cta?: LivestreamCTA
}

export const baseCTASchema = yup.object(baseCTAShape)

type FormValues = yup.InferType<typeof baseCTASchema>

const getInitialValues = (): FormValues => {
   return {
      message: "",
      buttonText: "Click here",
      buttonURL: "",
   }
}

export const CreateOrEditCTAForm = forwardRef<HTMLFormElement, Props>(
   ({ onCancel, onSuccess, cta }, ref) => {
      const isEdit = Boolean(cta)

      const { livestreamId, streamerAuthToken } = useStreamingContext()
      const { errorNotification } = useSnackbarNotifications()

      const formMethods = useYupForm({
         schema: baseCTASchema,
         defaultValues: isEdit ? cta : getInitialValues(),
         mode: "all",
         reValidateMode: "onBlur",
      })

      const onSubmit: SubmitHandler<FormValues> = async (data) => {
         const { message, buttonText, buttonURL } = data
         try {
            if (isEdit) {
               await livestreamService.updateCTA({
                  livestreamId,
                  livestreamToken: streamerAuthToken,
                  ctaId: cta.id,
                  message,
                  buttonText,
                  buttonURL,
               })
            } else {
               await livestreamService.createCTA({
                  livestreamId,
                  livestreamToken: streamerAuthToken,
                  message,
                  buttonText,
                  buttonURL,
               })
            }

            formMethods.reset(getInitialValues())

            onSuccess?.()
         } catch (error) {
            errorNotification(
               error,
               `Failed to ${
                  isEdit ? "update" : "create"
               } call to action, please try again.`
            )
         }
      }

      return (
         <FormProvider {...formMethods}>
            <Stack
               ref={ref}
               spacing={3}
               component="form"
               sx={styles.form}
               onSubmit={formMethods.handleSubmit(onSubmit)}
            >
               <Stack spacing={1.5}>
                  <ControlledBrandedTextField
                     multiline
                     maxRows={4}
                     name="message"
                     label="Message"
                     placeholder="Insert your CTA message"
                  />
                  <ControlledBrandedTextField
                     multiline
                     maxRows={4}
                     name="buttonText"
                     label="Button text"
                  />
                  <ControlledBrandedTextField
                     name="buttonURL"
                     label="Call to action URL"
                     placeholder="Insert your URL here"
                  />
               </Stack>

               <Stack spacing={1}>
                  <Box width="100%" component="span">
                     <LoadingButton
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={
                           formMethods.formState.isSubmitting ||
                           !formMethods.formState.isDirty ||
                           !formMethods.formState.isValid
                        }
                        loading={formMethods.formState.isSubmitting}
                     >
                        {isEdit ? "Save changes" : "Create CTA"}
                     </LoadingButton>
                  </Box>
                  {Boolean(onCancel) && (
                     <Button
                        variant="text"
                        color="grey"
                        fullWidth
                        onClick={onCancel}
                     >
                        Cancel
                     </Button>
                  )}
               </Stack>
            </Stack>
         </FormProvider>
      )
   }
)

CreateOrEditCTAForm.displayName = "CreateOrEditCTAForm"
