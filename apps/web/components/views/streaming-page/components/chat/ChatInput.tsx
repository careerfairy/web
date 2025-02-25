import { Box, CircularProgress, Fab } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { useLivestreamData } from "components/custom-hook/streaming"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { livestreamService } from "data/firebase/LivestreamService"
import { Send } from "react-feather"
import { Controller } from "react-hook-form"
import { useOpenStream } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerLivestreamEvent } from "util/analyticsUtils"
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
         width: 20,
         height: 21,
         marginLeft: "-2px",
         marginTop: "1px",
      },
      ml: 0.625,
   },
})

const MAX_MESSAGE_LENGTH = 340

const schema = Yup.object({
   message: Yup.string().trim().required().max(MAX_MESSAGE_LENGTH),
}).required()

export type FormValues = Yup.InferType<typeof schema>

type Props = {
   onMessageSend?: () => void
}

export const ChatInput = ({ onMessageSend }: Props) => {
   const { livestreamId, isHost, agoraUserId } = useStreamingContext()
   const { authenticatedUser, userData } = useAuth()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)
   const currentLivestream = useLivestreamData()
   const isOpenStream = useOpenStream()

   const { control, handleSubmit, reset, formState } = useYupForm({
      schema,
      defaultValues: {
         message: "",
      },
   })
   const { errorNotification } = useSnackbarNotifications()

   /**
    * Helper function to provide backwards compatibility with the old streaming app.
    * @returns The author's email or a placeholder string.
    */
   const getAuthorEmail = () => {
      if (userData?.isAdmin) return authenticatedUser.email

      if (isHost) return "Streamer"

      if (isOpenStream || !authenticatedUser.email) {
         return "anonymous"
      }

      return authenticatedUser.email
   }

   const onSubmit = async (data: FormValues) => {
      try {
         // Reset form fields after submission
         reset({
            message: "",
         })

         const displayName = userData?.isAdmin
            ? "CareerFairy"
            : getStreamerDisplayName(
                 streamerDetails?.firstName,
                 streamerDetails?.lastName
              )

         onMessageSend?.()
         await livestreamService.addChatEntry({
            livestreamId,
            message: data.message,
            type: isHost ? "streamer" : "viewer",
            displayName: displayName,
            authorEmail: getAuthorEmail(),
            agoraUserId,
            userUid: authenticatedUser.uid || "",
         })

         dataLayerLivestreamEvent(
            AnalyticsEvents.LivestreamChatNewMessage,
            currentLivestream
         )
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
                  onKeyDown={(event) => {
                     if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault() // Prevent the default action to avoid newline in input
                        handleSubmit(onSubmit)() // Programmatically submit the form
                     }
                  }}
                  onChange={(e) => {
                     field.onChange(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }}
                  sx={styles.input}
                  multiline
                  maxRows={4}
                  placeholder="Write your message"
                  readOnly={formState.isSubmitting}
               />
            )}
         />
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
            {formState.isSubmitting ? (
               <CircularProgress color="inherit" size={20} />
            ) : (
               <Send />
            )}
         </Fab>
      </Box>
   )
}
