import { Box, CircularProgress, Fab, OutlinedInput } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { Send } from "react-feather"
import { Controller } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as Yup from "yup"
import { useStreamingContext } from "../../context"
import { useAuth } from "HOCs/AuthProvider"
import { livestreamService } from "data/firebase/LivestreamService"
import { useOpenStream } from "store/selectors/streamingAppSelectors"
import { useStreamerDetails } from "components/custom-hook/streaming/useStreamerDetails"
import { getStreamerDisplayName } from "../../util"

const styles = sxStyles({
   root: {
      px: 2,
      py: 1.5,
      bgcolor: (theme) => theme.brand.white[200],
      borderTop: (theme) => `1px solid ${theme.brand.black[300]}`,
      display: "flex",
      alignItems: "center",
      position: "relative",
   },
   input: {
      flex: 1,
      width: "100%",
      borderRadius: "37px",
      height: 40,
      border: (theme) => `1px solid ${theme.palette.neutral[100]}`,
      "& .MuiOutlinedInput-notchedOutline": {
         m: "-4px",
         borderColor: "transparent",
      },
      "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
         borderColor: "transparent !important",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
         borderColor: (theme) => theme.brand.info[600],
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
         borderColor: (theme) => theme.brand.info[600],
      },
      "& legend": {
         display: "none",
      },
      "& fieldset": { top: 0 },
   },
   sendButton: {
      filter: "none",
      height: 40,
      width: 40,
      "& svg": {
         width: 20,
         height: 21,
      },
      ml: 0.625,
   },
})

const schema = Yup.object({
   message: Yup.string().trim().required("Message is required"),
}).required()

export type FormValues = Yup.InferType<typeof schema>

export const ChatInput = () => {
   const { livestreamId, isHost, agoraUserId } = useStreamingContext()
   const { authenticatedUser } = useAuth()
   const { data: streamerDetails } = useStreamerDetails(agoraUserId)

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
      if (isHost) return "Streamer"

      if (isOpenStream || !authenticatedUser.email) {
         return "anonymous"
      }

      return authenticatedUser.email
   }

   const onSubmit = async (data: FormValues) => {
      try {
         await livestreamService.addChatEntry({
            livestreamId,
            message: data.message,
            type: isHost ? "streamer" : "viewer",
            shortenedName: getStreamerDisplayName(
               streamerDetails?.firstName,
               streamerDetails?.lastName
            ),
            authorEmail: getAuthorEmail(),
            agoraUserId,
         })

         // Reset form fields after submission
         reset({
            message: "",
         })
      } catch (error) {
         errorNotification(
            error,
            "An error occurred while sending your message. Please try again in a few moments."
         )
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
                  sx={styles.input}
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
