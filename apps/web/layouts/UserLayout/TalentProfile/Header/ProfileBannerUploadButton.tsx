import { USER_BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/users/UserPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import {
   Box,
   Divider,
   ListItemIcon,
   Menu,
   MenuItem,
   Stack,
   Typography,
} from "@mui/material"
import { darken } from "@mui/material/styles"
import { useAuth } from "HOCs/AuthProvider"
import useFileUploader from "components/custom-hook/useFileUploader"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import FileUploader from "components/views/common/FileUploader"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import ImageCropperDialog from "components/views/common/ImageCropperDialog"
import { LineIcon } from "components/views/common/icons/LineIcon"
import { SlideUpTransition } from "components/views/common/transitions"
import { FC, useCallback, useState } from "react"
import { Camera, Image, Trash2, Upload } from "react-feather"
import { sxStyles } from "../../../../types/commonTypes"
import { ConfirmDeleteUserBannerDialog } from "./ConfirmDeleteUserBannerDialog"

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
   menu: {
      mt: 1,
      "& .MuiList-root": {
         py: "0 !important",
      },
   },
   mobileMenu: {
      "& .MuiPaper-root": {
         left: "unset !important",
         top: "unset !important",
         right: "unset !important",
         bottom: "0",
         // maxHeight: "138px",
         maxHeight: {
            xs: "170px",
            sm: "160px",
         },
         overflow: "hidden", // Prevent scrolling within menu
         width: "100dvw !important",
         maxWidth: "unset",
         borderBottomRightRadius: "0px",
         borderBottomLeftRadius: "0px",
      },
      "& .MuiBackdrop-root": {
         backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      "& .MuiList-root": {
         height: "100dvh",
      },
   },
   standardMenuItemIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "16px",
      height: "16px",
   },
   menuItem: {
      p: "12px 16px",
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
   const isMobile = useIsMobile()
   const { handleClick, open, handleClose, anchorEl } = useMenuState()

   const { userData } = useAuth()
   const [showUserBannerDelete, setShowUserBannerDelete] =
      useState<boolean>(false)

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
      onCancel: handleClose,
   })

   const handleCloseCropImageDialog = () => {
      handleClose()
      setLogoObjectUrl(null)
   }

   const handleCropperImageSubmit = useCallback(
      async (image: File) => {
         handleClose()
         handleUploadBannerPhoto(image)
      },
      [handleUploadBannerPhoto, handleClose]
   )

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
               onSubmit={handleCropperImageSubmit}
               key={`update-${userData.id}-profile-banner`}
               cropType="rectangle"
               cropBoxResizable
               aspectRatio={4 / 1}
            />
         ) : null}
         <LoadingButton
            sx={styles.button}
            onClick={handleClick}
            loading={loading}
            disabled={disabled}
            startIcon={<Box component={Camera} sx={styles.cameraIcon} />}
            variant="contained"
            color="grey"
            size="medium"
         />
         <Menu
            anchorEl={isMobile ? null : anchorEl}
            id="profile-banner-upload-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            // transformOrigin={transformOrigin}
            // anchorOrigin={anchorOrigin}
            TransitionComponent={isMobile ? SlideUpTransition : undefined}
            disableScrollLock={!isMobile}
            sx={[styles.menu, isMobile ? styles.mobileMenu : null]}
         >
            <ConditionalWrapper condition={isMobile}>
               <Stack alignItems={"center"}>
                  <LineIcon sx={{ width: "94px" }} />
               </Stack>
            </ConditionalWrapper>
            <Stack divider={<Divider sx={{ my: "0 !important" }} />}>
               <FileUploader {...logoUploaderProps}>
                  <MenuItem sx={styles.menuItem}>
                     <ListItemIcon>
                        <Box
                           component={Upload}
                           sx={styles.standardMenuItemIcon}
                        />
                     </ListItemIcon>
                     <Typography color={"neutral.600"}>
                        Upload new banner image
                     </Typography>
                  </MenuItem>
               </FileUploader>
               <MenuItem sx={styles.menuItem}>
                  <ListItemIcon>
                     <Box component={Image} sx={styles.standardMenuItemIcon} />
                  </ListItemIcon>
                  <Typography color={"neutral.600"}>
                     View current banner image
                  </Typography>
               </MenuItem>
               <ConditionalWrapper condition={userData.bannerImageUrl}>
                  <MenuItem
                     sx={styles.menuItem}
                     onClick={() => setShowUserBannerDelete(true)}
                  >
                     <ListItemIcon>
                        <Box
                           component={Trash2}
                           color="error.600"
                           width={"16px"}
                           height={"16px"}
                        />
                     </ListItemIcon>
                     <Typography color="error.600">
                        Remove banner image
                     </Typography>
                  </MenuItem>
               </ConditionalWrapper>
            </Stack>
         </Menu>
         <ConfirmDeleteUserBannerDialog
            onClose={() => setShowUserBannerDelete(false)}
            open={showUserBannerDelete}
            userId={userData.id}
         />
      </Box>
   )
}
