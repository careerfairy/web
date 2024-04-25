import {
   LivestreamPoll,
   MAX_POLL_OPTIONS,
   MIN_POLL_OPTIONS,
   basePollShape,
} from "@careerfairy/shared-lib/livestreams"
import { Button, IconButton, InputAdornment, Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { livestreamService } from "data/firebase/LivestreamService"
import { forwardRef } from "react"
import { FormProvider, SubmitHandler, useFieldArray } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import { useStreamingContext } from "../../context"
import { PlusCircle, Trash2 } from "react-feather"
import { v4 as uuid } from "uuid"
import { LoadingButton } from "@mui/lab"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Box } from "@mui/material"

const styles = sxStyles({
   form: {
      width: "100%",
      p: 1.5,
      borderRadius: "12px",
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      backgroundColor: (theme) => theme.brand.white[100],
   },
   addOptionButton: {
      color: "neutral.500",
      borderColor: "neutral.200",
   },
   removeOptionButton: {
      mt: -1.5,
      "& svg": {
         width: 16,
         height: 16,
         color: "neutral.600",
      },
   },
   errorMessage: {
      textAlign: "center",
   },
})

type Props = {
   onSuccess?: () => void
   onCancel?: () => void
   poll?: LivestreamPoll
}

export const basePollSchema = yup.object({
   question: basePollShape.question.required(),
   options: basePollShape.options.required(),
})

type FormValues = yup.InferType<typeof basePollSchema>

const generateOption = () => {
   return {
      text: "",
      id: uuid(),
   }
}

const getInitialValues = (): FormValues => {
   return {
      question: "",
      options: [generateOption(), generateOption()],
   }
}

export const CreateOrEditPollForm = forwardRef<HTMLFormElement, Props>(
   ({ onCancel, onSuccess, poll }, ref) => {
      const isEdit = Boolean(poll)

      const { livestreamId, agoraUserToken } = useStreamingContext()
      const { errorNotification } = useSnackbarNotifications()

      const formMethods = useYupForm({
         schema: basePollSchema,
         defaultValues: isEdit ? poll : getInitialValues(),
         mode: "all",
         reValidateMode: "onBlur",
      })

      const { fields, append, remove } = useFieldArray({
         control: formMethods.control,
         name: "options",
      })

      const onSubmit: SubmitHandler<FormValues> = async (data) => {
         const { question, options } = data
         try {
            if (isEdit) {
               await livestreamService.updatePoll({
                  livestreamId,
                  livestreamToken: agoraUserToken,
                  pollId: poll.id,
                  question,
                  options,
                  state: poll.state,
               })
            } else {
               await livestreamService.createPoll({
                  livestreamId,
                  livestreamToken: agoraUserToken,
                  question,
                  options,
               })
            }

            formMethods.reset(getInitialValues())

            onSuccess?.()
         } catch (error) {
            errorNotification(
               error,
               `Failed to ${
                  isEdit ? "update" : "create"
               } poll, please try again.`
            )
         }
      }

      return (
         <FormProvider {...formMethods}>
            <Stack
               ref={ref}
               spacing={2}
               component="form"
               sx={styles.form}
               onSubmit={formMethods.handleSubmit(onSubmit)}
            >
               <ControlledBrandedTextField
                  multiline
                  maxRows={4}
                  name="question"
                  label="Question"
                  placeholder="Insert your question here"
               />
               <Stack spacing={1}>
                  {fields.map((option, index) => (
                     <ControlledBrandedTextField
                        key={option.id}
                        fullWidth
                        name={`options.${index}.text`}
                        placeholder={`Insert option ${index + 1}`}
                        onKeyDown={preventSubmitOnEnter}
                        InputProps={{
                           endAdornment:
                              fields.length <= MIN_POLL_OPTIONS ? null : (
                                 <InputAdornment position="end">
                                    <IconButton
                                       sx={styles.removeOptionButton}
                                       aria-label="toggle password visibility"
                                       onClick={() => remove(index)}
                                       disabled={
                                          formMethods.formState.isSubmitting
                                       }
                                       edge="end"
                                       size="small"
                                    >
                                       <Trash2 />
                                    </IconButton>
                                 </InputAdornment>
                              ),
                           autoComplete: "off",
                        }}
                        label={`Option ${index + 1}`}
                     />
                  ))}
                  {fields.length < MAX_POLL_OPTIONS && (
                     <Button
                        variant="outlined"
                        color="grey"
                        type="button"
                        startIcon={<PlusCircle />}
                        onClick={() => append(generateOption())}
                        sx={styles.addOptionButton}
                        disabled={
                           fields.length >= MAX_POLL_OPTIONS ||
                           formMethods.formState.isSubmitting
                        }
                     >
                        Add an option
                     </Button>
                  )}
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
                        {isEdit ? "Save changes" : "Create Poll"}
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

const preventSubmitOnEnter = (e: React.KeyboardEvent) => {
   if (e.key === "Enter") {
      e.preventDefault()
   }
}

CreateOrEditPollForm.displayName = "CreateOrEditPollForm"
