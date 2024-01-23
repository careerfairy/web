import React, { FC } from "react"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/material"
import UploadBannerIcon from "@mui/icons-material/CameraAltOutlined"
import { sxStyles } from "../../../../types/commonTypes"
import { darken } from "@mui/material/styles"
import ImagePickerContainer from "../../../ssr/ImagePickerContainer"
import { dataURLtoFile } from "../../../helperFunctions/HelperFunctions"
import { v4 as uuidv4 } from "uuid"

type BannerPhotoUploadButtonProps = {
   handleUploadBannerPhoto: (photos: File) => Promise<void>
   loading: boolean
   disabled?: boolean
}

const styles = sxStyles({
   button: {
      bgcolor: "white",
      boxShadow: "none",
      "&:hover": {
         boxShadow: "none",
         bgcolor: (theme) => darken(theme.palette.common.white, 0.1),
      },
   },
})
const BannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
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
         <Box flexDirection="column" display="flex" alignItems="center">
            <LoadingButton
               sx={styles.button}
               loading={loading}
               disabled={disabled}
               startIcon={<UploadBannerIcon />}
               variant="contained"
               color="grey"
               size="large"
            >
               Edit cover photo
            </LoadingButton>
         </Box>
      </ImagePickerContainer>
   )
}
export default BannerUploadButton
