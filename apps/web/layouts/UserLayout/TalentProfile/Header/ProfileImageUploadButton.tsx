import { USER_AVATAR_IMAGE_SPECS } from "@careerfairy/shared-lib/users/UserPresenter"
import { darken } from "@mui/material/styles"
import { useAuth } from "HOCs/AuthProvider"
import { useDeleteUserAvatarImage } from "components/custom-hook/user/useDeleteUserAvatarImage"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import { FC, Fragment, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import { ConfirmDeleteUserImageDialog } from "./ConfirmDeleteUserImageDialog"
import {
   ImageUploadButton,
   ProfileImageUploadOptions,
} from "./ImageUploadButton"

const styles = sxStyles({
   button: {
      backgroundColor: (theme) => theme.palette.neutral[50],
      borderRadius: "18px",
      border: (theme) => `1px solid ${theme.brand.white[100]}`,
      minWidth: "unset !important",
      boxShadow: "none",
      p: "9px 9px",
      "&:hover": {
         boxShadow: "none",
         bgcolor: (theme) => darken(theme.palette.common.white, 0.1),
      },
      "& .MuiButton-startIcon": {
         margin: "unset",
      },
   },
   cameraIcon: {
      color: (theme) => theme.brand.black[700],
      width: "14px",
      height: "14px",
   },
})

const userAvatarImageValidator = getImageDimensionsValidator({
   maxHeight: USER_AVATAR_IMAGE_SPECS.maxHeight,
   maxWidth: USER_AVATAR_IMAGE_SPECS.maxWidth,
   minHeight: USER_AVATAR_IMAGE_SPECS.minHeight,
   minWidth: USER_AVATAR_IMAGE_SPECS.minWidth,
   getErrorMessage: (width, height) => {
      if (
         width < USER_AVATAR_IMAGE_SPECS.minWidth ||
         height < USER_AVATAR_IMAGE_SPECS.minHeight
      ) {
         // TODO-WG: Improve this message
         return "Image is too small"
      }
      return ""
   },
})

type ProfileImageUploadButtonProps = {
   handleUploadAvatarPhoto: (photos: File) => Promise<void>
   loading: boolean
   disabled?: boolean
}

export const ProfileImageUploadButton: FC<ProfileImageUploadButtonProps> = ({
   loading,
   handleUploadAvatarPhoto,
   disabled,
}) => {
   const { userData } = useAuth()
   const [showDeleteConfirmation, setShowDeleteConfirmation] =
      useState<boolean>(false)

   const {
      trigger: triggerDeleteUserAvatar,
      isMutating: isDeletingUserAvatar,
   } = useDeleteUserAvatarImage(userData.id)

   const options: ProfileImageUploadOptions = {
      imageValidator: userAvatarImageValidator,
      allowedFormats: USER_AVATAR_IMAGE_SPECS.allowedFormats,
      maxSize: USER_AVATAR_IMAGE_SPECS.maxSize,
      imageSrc: userData?.avatar,
      cropper: {
         title: "Upload profile picture",
         type: "circle",
         key: `update-${userData.id}-profile-avatar`,
         aspectRatio: 1,
      },
      menu: {
         id: "profile-avatar-upload-menu",
         uploadImageText: "Upload new profile picture",
         viewImageText: "View current profile picture",
         removeImageText: "Remove profile picture",
         handleRemoveClick: () => setShowDeleteConfirmation(true),
      },
   }

   return (
      <Fragment>
         <ImageUploadButton
            loading={loading}
            handleUploadImage={handleUploadAvatarPhoto}
            disabled={disabled}
            options={options}
            buttonSx={styles.button}
            cameraSx={styles.cameraIcon}
         />
         <ConfirmDeleteUserImageDialog
            title="Remove profile picture?"
            description="Are you sure you want to remove your profile picture?"
            triggerDeleteImage={triggerDeleteUserAvatar}
            isDeleting={isDeletingUserAvatar}
            onClose={() => setShowDeleteConfirmation(false)}
            open={showDeleteConfirmation}
         />
      </Fragment>
   )
}
