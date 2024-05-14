import { Box, CircularProgress, Fab, OutlinedInput } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import { Fragment } from "react"
import { Send } from "react-feather"
import { Controller } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import { useStreamingContext } from "../../context"
import { getStreamerDisplayName } from "../../util"

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
      borderRadius: "24px",
      border: (theme) => `1px solid ${theme.palette.neutral[100]}`,
      "& .MuiInputBase-input": {
         pr: 3,
      },
   },
   loader: {
      width: 30,
      height: 30,
      position: "absolute",
      right: 4,
      top: "50%",
      transform: "translateY(-50%)",
      minHeight: "auto",
   },
})

const MAX_MESSAGE_LENGTH = 340

const schema = Yup.object({
   message: Yup.string().trim().required().max(MAX_MESSAGE_LENGTH),
}).required()

type FormValues = Yup.InferType<typeof schema>

type Props = {
   questionId: string
   onCommentPosted?: () => void
}

export const CommentInput = ({ questionId, onCommentPosted }: Props) => {
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

         onCommentPosted?.()
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
               <OutlinedInput
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
                     <Fragment>
                        {formState.isSubmitting ? (
                           <LoadingIndicator />
                        ) : (
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
                        )}
                     </Fragment>
                  }
               />
            )}
         />
      </Box>
   )
}

const LoadingIndicator = () => {
   return (
      <Box sx={styles.loader} component="span">
         <CircularProgress size="inherit" />
      </Box>
   )
}
