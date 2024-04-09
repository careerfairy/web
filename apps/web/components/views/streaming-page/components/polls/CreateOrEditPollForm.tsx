import {
   LivestreamPoll,
   basePollShape,
} from "@careerfairy/shared-lib/livestreams"
import {
   Button,
   FormHelperText,
   IconButton,
   InputAdornment,
   Stack,
} from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { livestreamService } from "data/firebase/LivestreamService"
import { forwardRef } from "react"
import { FormProvider, SubmitHandler, useFieldArray } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"
import { useStreamingContext } from "../../context"
import { PlusCircle, Trash } from "react-feather"
import { v4 as uuid } from "uuid"
import { LoadingButton } from "@mui/lab"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Box } from "@mui/material"

const styles = sxStyles({
   form: {
      width: "100%",
      p: 1.5,
      border: "1px solid #F8F8F8",
      background: "#FFF",
      borderRadius: "11px",
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
      },
   },
   errorMessage: {
      textAlign: "center",
   },
})

type EditPollFormProps = {
   poll: LivestreamPoll
   onSuccess?: () => void
   onCancel?: () => void
}

type CreatePollFormProps = {
   onSuccess?: () => void
}

type Props = EditPollFormProps | CreatePollFormProps

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
   (props, ref) => {
      const isEdit = "poll" in props && props.poll !== undefined

      const { onSuccess } = props

      const onCancel = isEdit ? props.onCancel : undefined

      const { livestreamId, agoraUserToken } = useStreamingContext()
      const { errorNotification } = useSnackbarNotifications()

      const formMethods = useYupForm({
         schema: basePollSchema,
         defaultValues: isEdit ? props.poll : getInitialValues(),
         mode: "onChange",
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
                  pollId: props.poll.id,
                  question,
                  options,
                  state: props.poll.state,
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
               spacing={3}
               component="form"
               sx={styles.form}
               onKeyDown={preventSubmitOnEnter}
               onSubmit={formMethods.handleSubmit(onSubmit)}
            >
               <ControlledBrandedTextField name="question" label="Question" />
               <Stack spacing={1.5}>
                  {fields.map((option, index) => (
                     <ControlledBrandedTextField
                        key={option.id}
                        fullWidth
                        name={`options.${index}.text`}
                        InputProps={{
                           endAdornment: (
                              <InputAdornment position="end">
                                 <IconButton
                                    sx={styles.removeOptionButton}
                                    aria-label="toggle password visibility"
                                    onClick={() => remove(index)}
                                    disabled={
                                       fields.length <= 2 ||
                                       formMethods.formState.isSubmitting
                                    }
                                    edge="end"
                                    size="small"
                                 >
                                    <Trash />
                                 </IconButton>
                              </InputAdornment>
                           ),
                        }}
                        label={`Option ${index + 1}`}
                     />
                  ))}
                  {fields.length <= 4 && (
                     <Button
                        variant="outlined"
                        color="grey"
                        startIcon={<PlusCircle />}
                        onClick={() => append(generateOption())}
                        sx={styles.addOptionButton}
                        disabled={
                           fields.length >= 4 ||
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
                           !formMethods.formState.isDirty
                        }
                        loading={formMethods.formState.isSubmitting}
                     >
                        {isEdit ? "Save changes" : "Create Poll"}
                     </LoadingButton>
                     {Boolean(formMethods.formState.errors.options?.root) && (
                        <FormHelperText sx={styles.errorMessage} error>
                           {formMethods.formState.errors.options?.root.message}
                        </FormHelperText>
                     )}
                  </Box>
                  {Boolean(isEdit) && (
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
