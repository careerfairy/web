import {
   LivestreamPoll,
   // basePollSchema,
   // getBasePollSchema,
} from "@careerfairy/shared-lib/livestreams"
import {
   Button,
   Collapse,
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
import { TransitionGroup } from "react-transition-group"

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
})

type Props = {
   poll?: LivestreamPoll | null
}

export const CreateOrEditPollForm = forwardRef<HTMLFormElement, Props>(
   ({ poll }, ref) => {
      const { livestreamId, agoraUserToken } = useStreamingContext()
      const isEdit = Boolean(poll)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const basePollSchema = {} as any
      // const basePollSchema = getBasePollSchema(isEdit)

      type FormValues = yup.InferType<typeof basePollSchema>
      const formMethods = useYupForm({
         schema: basePollSchema,
         defaultValues: isEdit ? poll : { question: "", options: [] },
      })

      const { fields, append, remove } = useFieldArray({
         control: formMethods.control,
         name: "options",
      })

      console.log(
         "🚀 ~ file: CreateOrEditPollForm.tsx:76 ~ errors:",
         formMethods.formState.errors
      )

      const onSubmit: SubmitHandler<FormValues> = (data) => {
         const { question, options } = data
         console.log("🚀 ~ file: CreateOrEditPollForm.tsx:30 ~ poll:", data)
         if (isEdit) {
            return livestreamService.updatePoll({
               livestreamId,
               livestreamToken: agoraUserToken,
               pollId: poll.id,
               question,
               options,
               state: poll.state,
            })
         } else {
            return livestreamService.createPoll({
               livestreamId,
               livestreamToken: agoraUserToken,
               question,
               options,
            })
         }
      }

      return (
         <FormProvider {...formMethods}>
            <Stack
               sx={styles.form}
               spacing={3}
               component="form"
               onSubmit={formMethods.handleSubmit(onSubmit)}
               ref={ref}
            >
               <ControlledBrandedTextField
                  name="question"
                  label="Question"
                  required
               />
               <Stack spacing={1.5} component={TransitionGroup}>
                  {fields.map((option, index) => (
                     <Collapse key={option.id}>
                        <ControlledBrandedTextField
                           fullWidth
                           name={`options.${index}.text`}
                           InputProps={{
                              endAdornment: (
                                 <InputAdornment position="end">
                                    <IconButton
                                       sx={styles.removeOptionButton}
                                       aria-label="toggle password visibility"
                                       onClick={() => remove(index)}
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
                     </Collapse>
                  ))}
                  {fields.length <= 4 && (
                     <Button
                        variant="outlined"
                        color="grey"
                        startIcon={<PlusCircle />}
                        onClick={() => append({ text: "", id: undefined })}
                        sx={styles.addOptionButton}
                        disabled={fields.length >= 4}
                     >
                        Add an option
                     </Button>
                  )}
               </Stack>
               <Button variant="contained" color="primary" type="submit">
                  {isEdit ? "Update Poll" : "Create Poll"}
               </Button>
            </Stack>
         </FormProvider>
      )
   }
)

CreateOrEditPollForm.displayName = "CreateOrEditPollForm"
