import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/material"
import { darken } from "@mui/material/styles"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"
import ImagePickerContainer from "components/ssr/ImagePickerContainer"
import { FC } from "react"
import { Camera } from "react-feather"
import { v4 as uuidv4 } from "uuid"
import { sxStyles } from "../../../../types/commonTypes"

type BannerPhotoUploadButtonProps = {
   handleUploadBannerPhoto: (photos: File) => Promise<void>
   loading: boolean
   disabled?: boolean
}

const styles = sxStyles({
   buttonWrapper: {
      // bgcolor: "rgba(255, 255, 255, 0.50)",
      // borderRadius: "18px",
      // border: theme => `1px solid ${theme.palette.neutral[200]}`,
   },
   button: {
      bgcolor: "rgba(255, 255, 255, 0.50)",
      borderRadius: "18px",
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      minWidth: "unset !important",
      boxShadow: "none",
      "&:hover": {
         boxShadow: "none",
         bgcolor: (theme) => darken(theme.palette.common.white, 0.1),
      },
   },
})
const ProfileBannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
   loading,
   handleUploadBannerPhoto,
   disabled,
}) => {
   const { errorNotification } = useSnackbarNotifications()

   return (
      <ImagePickerContainer
         extensions={BANNER_IMAGE_SPECS.allowedFormats}
         maxSize={BANNER_IMAGE_SPECS.maxSize}
         dims={{
            minWidth: BANNER_IMAGE_SPECS.minWidth,
            maxWidth: BANNER_IMAGE_SPECS.maxWidth,
            minHeight: BANNER_IMAGE_SPECS.minHeight,
            maxHeight: BANNER_IMAGE_SPECS.maxHeight,
         }}
         onChange={(base64Img) => {
            const fileObject = dataURLtoFile(base64Img, uuidv4())
            return handleUploadBannerPhoto(fileObject)
         }}
         onError={(err) => errorNotification(err, err)}
      >
         <Box
            flexDirection="column"
            display="flex"
            alignItems="center"
            sx={styles.buttonWrapper}
         >
            <LoadingButton
               sx={styles.button}
               loading={loading}
               disabled={disabled}
               startIcon={<Camera />}
               variant="contained"
               color="grey"
               size="medium"
            />
         </Box>
      </ImagePickerContainer>
   )
}
export default ProfileBannerUploadButton
