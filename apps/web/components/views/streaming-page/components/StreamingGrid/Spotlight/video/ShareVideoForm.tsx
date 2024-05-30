import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import { Box, Stack, Typography } from "@mui/material"
import { useYupForm } from "components/custom-hook/form/useYupForm"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { YOUTUBE_URL_REGEX } from "components/util/constants"
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { useStreamingContext } from "components/views/streaming-page/context"
import { livestreamService } from "data/firebase/LivestreamService"
import { Youtube } from "react-feather"
import { FormProvider, SubmitHandler } from "react-hook-form"
import { sxStyles } from "types/commonTypes"
import * as yup from "yup"

const styles = sxStyles({
   header: {
      mb: 2,
   },
   actions: {
      mt: 4,
      p: 0,
      maxWidth: 600,
      mx: "auto",
   },
   icon: {
      width: 48,
      height: 48,
      color: "primary.main",
   },
})

const videoUrlSchema = yup.object().shape({
   videoUrl: yup
      .string()
      .matches(YOUTUBE_URL_REGEX, {
         message: "Must be a valid youtube video url",
      })
      .required("Must be a valid youtube video url"),
})

type FormValues = yup.InferType<typeof videoUrlSchema>

type Props = {
   onClose: () => void
}

export const ShareVideoForm = ({ onClose }: Props) => {
   const { livestreamId, agoraUserId } = useStreamingContext()

   const { trigger: setLivestreamMode } = useSetLivestreamMode(livestreamId)

   const { errorNotification } = useSnackbarNotifications()

   const formMethods = useYupForm({
      schema: videoUrlSchema,
      mode: "all",
      reValidateMode: "onChange",
   })

   const onSubmit: SubmitHandler<FormValues> = async (data) => {
      try {
         await livestreamService.setLivestreamVideo({
            livestreamId,
            url: data.videoUrl,
            updater: agoraUserId,
         })

         setLivestreamMode({
            mode: LivestreamModes.VIDEO,
         })

         formMethods.reset()

         onClose()
      } catch (error) {
         errorNotification(error, "Failed to share video, please try again.", {
            livestreamId,
            data,
         })
      }
   }

   return (
      <FormProvider {...formMethods}>
         <Box component="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Stack
               sx={styles.header}
               spacing={2}
               alignItems="center"
               justifyContent="center"
            >
               <Box component={Youtube} sx={styles.icon} />
               <Stack
                  spacing={0.75}
                  justifyContent="center"
                  alignItems="center"
               >
                  <Typography
                     variant="mobileBrandedH3"
                     fontWeight={600}
                     color="neutral.900"
                  >
                     Share a video
                  </Typography>

                  <Typography
                     variant="medium"
                     color="neutral.700"
                     textAlign="center"
                  >
                     {`When sharing a video, the player actions (play, pause, etc) will be replayed
 on the viewer's screens as well.`}
                  </Typography>
               </Stack>
            </Stack>
            <ControlledBrandedTextField
               name="videoUrl"
               label="Insert video URL"
               placeholder="Ex: https://www.youtube.com/watch?=123hre"
               fullWidth
            />
            <Stack
               sx={styles.actions}
               justifyContent={"center"}
               alignItems="center"
               direction="row"
               spacing={1.5}
            >
               <LoadingButton
                  fullWidth
                  onClick={onClose}
                  variant="outlined"
                  color="grey"
               >
                  Cancel
               </LoadingButton>
               <LoadingButton
                  type="submit"
                  fullWidth
                  disabled={!formMethods.formState.isDirty}
                  loading={formMethods.formState.isSubmitting}
                  variant="contained"
                  color="primary"
                  className="share-video-button"
               >
                  Share video
               </LoadingButton>
            </Stack>
         </Box>
      </FormProvider>
   )
}
