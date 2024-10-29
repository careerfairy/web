import { USER_BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/users/UserPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/material"
import { darken, useTheme } from "@mui/material/styles"
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
      height: "32px",
   },
   button: {
      bgcolor: "rgba(255, 255, 255, 0.50)",
      borderRadius: "18px",
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      minWidth: "unset !important",
      boxShadow: "none",
      p: "8px 9px",
      "&:hover": {
         boxShadow: "none",
         bgcolor: (theme) => darken(theme.palette.common.white, 0.1),
      },
      "& .MuiButton-startIcon": {
         margin: "unset",
      },
   },
})

export const ProfileBannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
   loading,
   handleUploadBannerPhoto,
   disabled,
}) => {
   const { errorNotification } = useSnackbarNotifications()
   const theme = useTheme()

   return (
      <ImagePickerContainer
         extensions={USER_BANNER_IMAGE_SPECS.allowedFormats}
         maxSize={USER_BANNER_IMAGE_SPECS.maxSize}
         dims={{
            minWidth: USER_BANNER_IMAGE_SPECS.minWidth,
            maxWidth: USER_BANNER_IMAGE_SPECS.maxWidth,
            minHeight: USER_BANNER_IMAGE_SPECS.minHeight,
            maxHeight: USER_BANNER_IMAGE_SPECS.maxHeight,
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
               startIcon={
                  <Camera
                     color={theme.brand.white[50]}
                     width={"14px"}
                     height={"14px"}
                  />
               }
               variant="contained"
               color="grey"
               size="medium"
            />
         </Box>
      </ImagePickerContainer>
   )
}
