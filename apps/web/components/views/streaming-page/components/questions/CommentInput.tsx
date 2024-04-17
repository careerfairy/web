import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Send } from "react-feather"
import { Fab } from "@mui/material"
import * as Yup from "yup"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Controller } from "react-hook-form"
import { StreamInput } from "../StreamInput"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   sendButton: {
      filter: "none",
      "& svg": {
         width: 20,
         height: 20,
         marginLeft: "-2px",
         marginTop: "1px",
      },
      width: 30,
      height: 30,
      position: "absolute",
      right: 4,
      top: "50%",
      transform: "translateY(-50%)",
      minHeight: "auto",
   },
   input: {
      width: "100%",
      height: 38,
   },
})

const MAX_MESSAGE_LENGTH = 340

const schema = Yup.object({
   message: Yup.string().trim().required().max(MAX_MESSAGE_LENGTH),
}).required()

type FormValues = Yup.InferType<typeof schema>

export const CommentInput = () => {
   const { errorNotification } = useSnackbarNotifications()

   const { control, handleSubmit, reset, formState } = useYupForm({
      schema,
      defaultValues: {
         message: "",
      },
   })

   const onSubmit = async (data: FormValues) => {
      try {
         // Reset form fields after submission
         reset({
            message: "",
         })

         // submit comment
      } catch (error) {
         errorNotification(
            error,
            "An error occurred while sending your message. Please try again in a few moments."
         )
         // Fall back to the original message if the new message fails to send
         reset({
            message: data.message,
         })
      }
   }

   return (
      <Box sx={styles.root} component="form" onSubmit={handleSubmit(onSubmit)}>
         <Controller
            name="message"
            control={control}
            render={({ field }) => (
               <StreamInput
                  {...field}
                  onChange={(e) => {
                     field.onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }}
                  sx={styles.input}
                  readOnly={formState.isSubmitting}
                  placeholder="Answer with text"
                  endAdornment={
                     <Fab
                        aria-label="Send message"
                        color="primary"
                        size="small"
                        disabled={
                           !formState.isDirty ||
                           !formState.isValid ||
                           formState.isSubmitting
                        }
                        type="submit"
                        sx={styles.sendButton}
                     >
                        <Send />
                     </Fab>
                  }
               />
            )}
         />
      </Box>
   )
}
