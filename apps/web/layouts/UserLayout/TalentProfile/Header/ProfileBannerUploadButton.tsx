import { USER_BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/users/UserPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/material"
import { darken } from "@mui/material/styles"
import { useAuth } from "HOCs/AuthProvider"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import ImageCropperDialog from "components/views/common/ImageCropperDialog"
import { FC, useState } from "react"
import { Camera } from "react-feather"
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
   cameraIcon: {
      height: "14px",
      width: "14px",
      color: (theme) => theme.brand.white[50],
   },
})

const userBannerImageValidator = getImageDimensionsValidator({
   maxHeight: USER_BANNER_IMAGE_SPECS.maxHeight,
   maxWidth: USER_BANNER_IMAGE_SPECS.maxWidth,
   minHeight: USER_BANNER_IMAGE_SPECS.minHeight,
   minWidth: USER_BANNER_IMAGE_SPECS.minWidth,
})

export const ProfileBannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
   loading,
   handleUploadBannerPhoto,
   disabled,
}) => {
   // const { handleClick, open, handleClose, anchorEl } = useMenuState()
   const { userData } = useAuth()
   const [logoObjectUrl, setLogoObjectUrl] = useState<string | null>(null)

   const setLogo = (file, logoSetter) => {
      const newFile = Array.isArray(file) ? file[0] : file
      logoSetter(URL.createObjectURL(newFile))
   }

   const { fileUploaderProps: logoUploaderProps } = useFileUploader({
      acceptedFileTypes: USER_BANNER_IMAGE_SPECS.allowedFormats,
      maxFileSize: USER_BANNER_IMAGE_SPECS.maxSize,
      multiple: false,
      onValidated: (file) => setLogo(file, setLogoObjectUrl),
      customValidations: [userBannerImageValidator],
   })

   const handleCloseCropImageDialog = () => {
      setLogoObjectUrl(null)
   }

   return (
      <Box
         flexDirection="column"
         display="flex"
         alignItems="center"
         sx={styles.buttonWrapper}
      >
         {logoObjectUrl ? (
            <ImageCropperDialog
               title={"Edit profile banner picture"}
               fileName={undefined}
               imageSrc={logoObjectUrl}
               open={Boolean(logoObjectUrl)}
               handleClose={handleCloseCropImageDialog}
               onSubmit={handleUploadBannerPhoto}
               key={`update-${userData.id}-profile-banner`}
               cropType="rectangle"
               cropBoxResizable
               aspectRatio={4 / 1}
            />
         ) : null}
         <FileUploader sx={{}} {...logoUploaderProps}>
            <LoadingButton
               sx={styles.button}
               loading={loading}
               disabled={disabled}
               startIcon={<Box component={Camera} sx={styles.cameraIcon} />}
               variant="contained"
               color="grey"
               size="medium"
            />
         </FileUploader>
      </Box>
   )
}
