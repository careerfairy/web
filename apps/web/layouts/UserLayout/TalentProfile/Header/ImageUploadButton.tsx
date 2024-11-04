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
import { SxProps, darken } from "@mui/material/styles"
import useFileUploader from "components/custom-hook/useFileUploader"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import FileUploader, {
   ValidationObject,
} from "components/views/common/FileUploader"
import ImageCropperDialog, {
   CropType,
} from "components/views/common/ImageCropperDialog"
import ImagePreview from "components/views/common/ImagePreview"
import { LineIcon } from "components/views/common/icons/LineIcon"
import { SlideUpTransition } from "components/views/common/transitions"
import { FC, useCallback, useMemo, useState } from "react"
import { Camera, Image, Trash2, Upload } from "react-feather"
import { SlideImage } from "yet-another-react-lightbox"
import { sxStyles } from "../../../../types/commonTypes"

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
         maxHeight: {
            xs: "170px",
            sm: "160px",
         },
         overflow: "hidden",
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
   mobileMenuWithoutImage: {
      "& .MuiPaper-root": {
         maxHeight: {
            xs: "90px",
            sm: "80px",
         },
      },
   },
   standardMenuItemIcon: {
      color: (theme) => theme.palette.neutral[600],
      width: "16px",
      height: "16px",
   },
   deleteIcon: {
      color: (theme) => theme.brand.error[600],
      width: "16px",
      height: "16px",
   },
   menuItem: {
      p: "12px 16px",
   },
})

type CropperOptions = {
   title: string
   key: string
   type: CropType
   aspectRatio: number
}

type MenuOptions = {
   id: string
   uploadImageText: string
   viewImageText: string
   removeImageText: string
   handleRemoveClick: () => void
}

export type ProfileImageUploadOptions = {
   imageValidator: ValidationObject
   allowedFormats: string[]
   maxSize: number
   imageSrc?: string
   cropper: CropperOptions
   menu: MenuOptions
}

type ImageUploadButtonProps = {
   handleUploadImage: (image: File) => Promise<void>
   loading: boolean
   disabled?: boolean
   options: ProfileImageUploadOptions
   buttonSx?: SxProps
}

export const ImageUploadButton: FC<ImageUploadButtonProps> = ({
   loading,
   handleUploadImage,
   disabled,
   options,
   buttonSx,
}) => {
   const { imageValidator, allowedFormats, maxSize, imageSrc, cropper, menu } =
      options

   // const imageSrcUrl = useMemo( () => imageSrc, [imageSrc])

   const isMobile = useIsMobile()

   const { handleClick, open, handleClose, anchorEl } = useMenuState()

   const [index, setIndex] = useState(-1)

   const photo: SlideImage[] = useMemo(() => {
      if (imageSrc) {
         return [
            {
               src: imageSrc,
            },
         ]
      }
      return null
   }, [imageSrc])

   const [objectUrl, setObjectUrl] = useState<string | null>(null)

   const setImage = (file, imageSetter) => {
      const newFile = Array.isArray(file) ? file[0] : file
      imageSetter(URL.createObjectURL(newFile))
   }

   const { fileUploaderProps: logoUploaderProps } = useFileUploader({
      acceptedFileTypes: allowedFormats,
      maxFileSize: maxSize,
      multiple: false,
      onValidated: (file) => setImage(file, setObjectUrl),
      customValidations: [imageValidator],
      onCancel: handleClose,
   })

   const handleCloseCropImageDialog = () => {
      handleClose()
      setObjectUrl(null)
   }

   const handleCropperImageSubmit = useCallback(
      async (image: File) => {
         handleClose()
         handleUploadImage(image)
      },
      [handleUploadImage, handleClose]
   )

   return (
      <Box
         flexDirection="column"
         display="flex"
         alignItems="center"
         sx={styles.buttonWrapper}
      >
         {objectUrl ? (
            <ImageCropperDialog
               title={cropper.title}
               fileName={undefined}
               imageSrc={objectUrl}
               open={Boolean(objectUrl)}
               handleClose={handleCloseCropImageDialog}
               onSubmit={handleCropperImageSubmit}
               key={cropper.key}
               cropType={cropper.type}
               cropBoxResizable
               aspectRatio={cropper.aspectRatio}
            />
         ) : null}
         <LoadingButton
            sx={buttonSx ? buttonSx : styles.button}
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
            id={menu.id}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            TransitionComponent={isMobile ? SlideUpTransition : undefined}
            disableScrollLock={!isMobile}
            sx={[
               styles.menu,
               isMobile ? styles.mobileMenu : null,
               isMobile && !imageSrc ? styles.mobileMenuWithoutImage : null,
            ]}
         >
            <ConditionalWrapper condition={isMobile}>
               <Stack alignItems={"center"}>
                  <LineIcon sx={{ width: "94px" }} />
               </Stack>
            </ConditionalWrapper>
            <Stack
               divider={
                  imageSrc ? <Divider sx={{ my: "0 !important" }} /> : null
               }
            >
               <FileUploader {...logoUploaderProps}>
                  <MenuItem sx={styles.menuItem}>
                     <ListItemIcon>
                        <Box
                           component={Upload}
                           sx={styles.standardMenuItemIcon}
                        />
                     </ListItemIcon>
                     <Typography color={"neutral.600"}>
                        {menu.uploadImageText}
                     </Typography>
                  </MenuItem>
               </FileUploader>
               <ConditionalWrapper condition={Boolean(imageSrc)}>
                  <MenuItem sx={styles.menuItem} onClick={() => setIndex(0)}>
                     <ListItemIcon>
                        <Box
                           component={Image}
                           sx={styles.standardMenuItemIcon}
                        />
                     </ListItemIcon>
                     <Typography color={"neutral.600"}>
                        {menu.viewImageText}
                     </Typography>
                  </MenuItem>
               </ConditionalWrapper>
               <ConditionalWrapper condition={Boolean(imageSrc)}>
                  <MenuItem
                     sx={styles.menuItem}
                     onClick={menu.handleRemoveClick}
                  >
                     <ListItemIcon>
                        <Box component={Trash2} sx={styles.deleteIcon} />
                     </ListItemIcon>
                     <Typography color="error.600">
                        {menu.removeImageText}
                     </Typography>
                  </MenuItem>
               </ConditionalWrapper>
            </Stack>
         </Menu>
         <ConditionalWrapper condition={Boolean(photo?.length)}>
            <ImagePreview
               photos={photo}
               photoIndex={index}
               close={() => setIndex(-1)}
            />
         </ConditionalWrapper>
      </Box>
   )
}
