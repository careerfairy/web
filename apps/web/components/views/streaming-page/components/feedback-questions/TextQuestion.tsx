import { FeedbackQuestionUserAnswer } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { OutlinedInput, Stack } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { Controller } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"

const styles = sxStyles({
   answerWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "12px",
      width: "100%",
   },

   sendButton: {
      display: "flex",
      height: "40px",
      padding: "12px 24px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      alignSelf: "stretch",
   },
   input: {
      display: "flex",
      height: "98px",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "24px",
      width: "100%",
      fontSize: "16px",
      p: "6px 10px",
      "& textarea::placeholder": {
         color: "#B1B1B1",
         opacity: 1,
      },
      "& .MuiOutlinedInput-notchedOutline ": {
         borderRadius: "6px",
         border: "1.3px solid #D7D7D7",
      },
   },
})

const MAX_MESSAGE_LENGTH = 340

const schema = Yup.object({
   message: Yup.string().trim().required().max(MAX_MESSAGE_LENGTH),
}).required()

type FormValues = Yup.InferType<typeof schema>

type Props = {
   questionId: string
   onAnswerSubmit: (answer: FeedbackQuestionUserAnswer) => void
}

export const TextQuestion = ({ onAnswerSubmit }: Props) => {
   const { control, handleSubmit, formState } = useYupForm({
      schema,
      defaultValues: {
         message: "",
      },
   })

   const onSubmit = async (data: FormValues) => {
      // rating null for backwards compatibility on the B2B analytics dashboard
      onAnswerSubmit({ ...data, rating: null })
   }

   return (
      <Stack
         sx={styles.answerWrapper}
         component="form"
         onSubmit={handleSubmit(onSubmit)}
      >
         <Controller
            name="message"
            control={control}
            render={({ field }) => (
               <OutlinedInput
                  {...field}
                  onChange={(e) => {
                     field.onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }}
                  sx={styles.input}
                  readOnly={formState.isSubmitting}
                  placeholder="Write your message"
                  autoComplete="off"
                  size="small"
                  multiline
                  maxRows={4}
               />
            )}
         />

         <LoadingButton
            fullWidth
            variant="contained"
            size="medium"
            disabled={
               formState.isSubmitting ||
               !formState.isDirty ||
               !formState.isValid
            }
            loading={formState.isSubmitting}
            sx={styles.sendButton}
            type="submit"
         >
            Send
         </LoadingButton>
      </Stack>
   )
}
