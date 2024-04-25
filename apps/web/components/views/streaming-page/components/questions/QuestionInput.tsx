import { Box, CircularProgress, Fab } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import { Plus } from "react-feather"
import { Controller } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import { useStreamingContext } from "../../context"
import { getStreamerDisplayName } from "../../util"
import { StreamInput } from "../StreamInput"

const styles = sxStyles({
   root: {
      px: 2,
      py: 1.5,
      bgcolor: (theme) => theme.brand.white[200],
      borderTop: (theme) => `1px solid ${theme.brand.black[300]}`,
      display: "flex",
      alignItems: "flex-end",
   },
   input: {
      px: 1.5,
      py: 0.75,
      flex: 1,
      width: "100%",
      minHeight: 40,
   },
   sendButton: {
      filter: "none",
      height: 40,
      width: 40,
      "& svg": {
         width: 24,
         height: 24,
      },
      ml: 0.625,
   },
})

const MAX_MESSAGE_LENGTH = 340

const schema = Yup.object({
   message: Yup.string().trim().required().min(5).max(MAX_MESSAGE_LENGTH),
}).required()

export type FormValues = Yup.InferType<typeof schema>

type Props = {
   onQuestionSubmit?: () => void
}

export const QuestionInput = ({ onQuestionSubmit }: Props) => {
   const { agoraUserId, streamRef } = useStreamingContext()
   const { authenticatedUser, userData } = useAuth()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)

   const { control, handleSubmit, reset, formState } = useYupForm({
      schema,
      defaultValues: {
         message: "",
      },
   })

   const { errorNotification } = useSnackbarNotifications()

   const onSubmit = async (data: FormValues) => {
      try {
         reset({
            message: "",
         })

         const displayName = userData?.isAdmin
            ? "CareerFairy"
            : getStreamerDisplayName(
                 streamerDetails?.firstName,
                 streamerDetails?.lastName
              )

         onQuestionSubmit?.()

         await livestreamService.createQuestion(streamRef, {
            author: authenticatedUser.uid || null,
            badges: [],
            title: data.message,
            displayName,
            agoraUserId,
         })
      } catch (error) {
         errorNotification(
            error,
            "An error occurred while submitting your question. Please try again in a few moments."
         )
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
                  onKeyDown={(event) => {
                     if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        handleSubmit(onSubmit)()
                     }
                  }}
                  onChange={(e) => {
                     field.onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }}
                  sx={styles.input}
                  multiline
                  maxRows={4}
                  placeholder="Ask your question"
                  readOnly={formState.isSubmitting}
               />
            )}
         />
         <Fab
            aria-label="Submit question"
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
            {formState.isSubmitting ? (
               <CircularProgress color="inherit" size={20} />
            ) : (
               <Plus />
            )}
         </Fab>
      </Box>
   )
}
