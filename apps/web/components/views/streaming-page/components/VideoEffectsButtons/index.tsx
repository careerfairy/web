import { Grid } from "@mui/material"
import useUploadLivestreamBackgroundImage from "components/custom-hook/live-stream/useUploadLivestreamBackgroundImage"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { BlurIcon, PlaceholderImageIcon } from "components/views/common/icons"
import { useMemo } from "react"
import { Slash } from "react-feather"
import { useVirtualBackgroundMode } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks, useStreamingContext } from "../../context"
import { VirtualBackgroundMode } from "../../types"
import { BackgroundModeButton } from "./BackgroundModeButton"
import { useVirtualBackgroundHandlers } from "./useVirtualBackgroundHandlers"

const styles = sxStyles({
   fileUploader: {
      overflow: "hidden",
      display: "flex",
      borderRadius: 2,
      backgroundColor: "transparent",
      transition: (theme) => theme.transitions.create("background-color"),
      width: "100%",
   },
   fileUploaderActive: {
      backgroundColor: (theme) => theme.palette.action.focus,
   },
})

const ACCEPTED_FILE_TYPES = ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"]

export const VideoEffectsButtons = () => {
   const { livestreamId } = useStreamingContext()
   const { localCameraTrack, cameraOn } = useLocalTracks()
   const virtualBackgroundMode = useVirtualBackgroundMode()

   const {
      backgroundBlurringMutation: {
         trigger: blurringMutation,
         isMutating: blurringLoading,
         error: blurringError,
      },
      backgroundImageMutation: {
         trigger: imageMutation,
         isMutating: imageLoading,
         error: imageError,
      },
      clearBackgroundEffectsMutation: {
         trigger: clearMutation,
         isMutating: clearLoading,
      },
      checkCompatibility,
   } = useVirtualBackgroundHandlers(localCameraTrack.localCameraTrack)

   const { handleUploadImage, isLoading: isUploadingImage } =
      useUploadLivestreamBackgroundImage(livestreamId)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ACCEPTED_FILE_TYPES,
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         const image = await handleUploadImage(newFile)
         imageMutation({
            imageUrl: image.url,
         })
      },
   })

   const isCompatible = useMemo(() => {
      return checkCompatibility()
   }, [checkCompatibility])

   const loading =
      blurringLoading || imageLoading || clearLoading || isUploadingImage

   return (
      <Grid container spacing={1.5}>
         <Grid item xs={4}>
            <BackgroundModeButton
               loading={clearLoading}
               active={virtualBackgroundMode === VirtualBackgroundMode.OFF}
               label="No Effect"
               icon={<Slash />}
               onClick={() => clearMutation()}
               mode={VirtualBackgroundMode.OFF}
               disabled={loading || !cameraOn}
            />
         </Grid>
         <Grid item xs={4}>
            <BackgroundModeButton
               label="Background Blur"
               active={virtualBackgroundMode === VirtualBackgroundMode.BLUR}
               loading={blurringLoading}
               icon={<BlurIcon />}
               onClick={() => blurringMutation()}
               mode={VirtualBackgroundMode.BLUR}
               disabled={loading || !cameraOn}
               error={blurringError || !isCompatible}
            />
         </Grid>
         <Grid item xs={4}>
            <FileUploader
               {...fileUploaderProps}
               sx={[
                  styles.fileUploader,
                  dragActive && styles.fileUploaderActive,
               ]}
               disabled={loading}
            >
               <BackgroundModeButton
                  label="Custom Image"
                  active={virtualBackgroundMode === VirtualBackgroundMode.IMAGE}
                  loading={imageLoading || isUploadingImage}
                  icon={<PlaceholderImageIcon />}
                  mode={VirtualBackgroundMode.IMAGE}
                  disabled={loading || !cameraOn}
                  error={imageError || !isCompatible}
               />
            </FileUploader>
         </Grid>
      </Grid>
   )
}
