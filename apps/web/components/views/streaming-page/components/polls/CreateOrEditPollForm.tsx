import {
   LivestreamPoll,
   basePollSchema,
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

type Props = {
   poll?: LivestreamPoll | null
   onSuccess?: () => void
}

type FormValues = yup.InferType<typeof basePollSchema>

const generateOption = () => {
   return {
      text: "",
      id: uuid(),
   }
}

export const CreateOrEditPollForm = forwardRef<HTMLFormElement, Props>(
   ({ poll, onSuccess }, ref) => {
      const { livestreamId, agoraUserToken } = useStreamingContext()
      const { errorNotification } = useSnackbarNotifications()
      const isEdit = Boolean(poll)

      const formMethods = useYupForm({
         schema: basePollSchema,
         defaultValues: isEdit
            ? poll
            : { question: "", options: [generateOption(), generateOption()] },
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

            onSuccess?.()

            formMethods.reset(data)
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
                                    disabled={fields.length <= 2}
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
                        disabled={fields.length >= 4}
                     >
                        Add an option
                     </Button>
                  )}
               </Stack>
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
                     {isEdit ? "Update Poll" : "Create Poll"}
                  </LoadingButton>
                  {Boolean(formMethods.formState.errors.options?.root) && (
                     <FormHelperText sx={styles.errorMessage} error>
                        {formMethods.formState.errors.options?.root.message}
                     </FormHelperText>
                  )}
               </Box>
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
