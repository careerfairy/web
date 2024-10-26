import { USER_AVATAR_IMAGE_SPECS } from "@careerfairy/shared-lib/users/UserPresenter"
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

type ProfileImageUploadButtonProps = {
   handleUploadAvatarPhoto: (photos: File) => Promise<void>
   loading: boolean
   disabled?: boolean
}

const styles = sxStyles({
   buttonWrapper: {
      height: "30px",
   },
   button: {
      backgroundColor: (theme) => theme.palette.neutral[50],
      borderRadius: "18px",
      border: (theme) => `1px solid ${theme.brand.white[100]}`,
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
export const ProfileImageUploadButton: FC<ProfileImageUploadButtonProps> = ({
   loading,
   handleUploadAvatarPhoto,
   disabled,
}) => {
   const { errorNotification } = useSnackbarNotifications()
   const theme = useTheme()
   return (
      <ImagePickerContainer
         extensions={USER_AVATAR_IMAGE_SPECS.allowedFormats}
         maxSize={USER_AVATAR_IMAGE_SPECS.maxSize}
         dims={{
            minWidth: USER_AVATAR_IMAGE_SPECS.minWidth,
            maxWidth: USER_AVATAR_IMAGE_SPECS.maxWidth,
            minHeight: USER_AVATAR_IMAGE_SPECS.minHeight,
            maxHeight: USER_AVATAR_IMAGE_SPECS.maxHeight,
         }}
         onChange={(base64Img) => {
            const fileObject = dataURLtoFile(base64Img, uuidv4())
            return handleUploadAvatarPhoto(fileObject)
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
                     color={theme.brand.black[700]}
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
