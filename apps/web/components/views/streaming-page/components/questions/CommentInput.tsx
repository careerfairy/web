import { Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Send } from "react-feather"
import { Fab } from "@mui/material"
import * as Yup from "yup"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Controller } from "react-hook-form"
import { StreamInput } from "../StreamInput"
import { livestreamService } from "data/firebase/LivestreamService"
import { useStreamingContext } from "../../context"
import { getStreamerDisplayName } from "../../util"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { useAuth } from "HOCs/AuthProvider"

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
      "& .MuiInputBase-input": {
         pr: 3,
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
}

export const CommentInput = ({ questionId }: Props) => {
   const { errorNotification } = useSnackbarNotifications()
   const { agoraUserId, streamRef, isHost } = useStreamingContext()
   const { userData, authenticatedUser } = useAuth()

   const { data: streamerDetails } = useStreamerDetails(agoraUserId)

   const { control, handleSubmit, reset, formState } = useYupForm({
      schema,
      defaultValues: {
         message: "",
      },
   })

   const onSubmit = async (data: FormValues) => {
      try {
         reset({
            message: "",
         })

         await livestreamService.commentOnQuestion(streamRef, questionId, {
            author: getStreamerDisplayName(
               streamerDetails?.firstName,
               streamerDetails?.lastName
            ),
            authorType: userData?.isAdmin
               ? "careerfairy"
               : isHost
               ? "streamer"
               : "viewer",
            title: data.message,
            agoraUserId,
            userUid: authenticatedUser?.uid,
         })
      } catch (error) {
         errorNotification(
            error,
            "An error occurred while posting your comment. Please try again in a few moments."
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
                  onChange={(e) => {
                     field.onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }}
                  sx={styles.input}
                  readOnly={formState.isSubmitting}
                  placeholder="Answer with text"
                  autoComplete="off"
                  size="small"
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
