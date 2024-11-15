import { USER_BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/users/UserPresenter"
import { useAuth } from "HOCs/AuthProvider"
import { useDeleteUserBannerImage } from "components/custom-hook/user/useDeleteUserBannerImage"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import { FC, Fragment, useState } from "react"
import { ConfirmDeleteUserImageDialog } from "./ConfirmDeleteUserImageDialog"
import {
   ImageUploadButton,
   ProfileImageUploadOptions,
} from "./ImageUploadButton"

const userBannerImageValidator = getImageDimensionsValidator({
   maxHeight: USER_BANNER_IMAGE_SPECS.maxHeight,
   maxWidth: USER_BANNER_IMAGE_SPECS.maxWidth,
   minHeight: USER_BANNER_IMAGE_SPECS.minHeight,
   minWidth: USER_BANNER_IMAGE_SPECS.minWidth,
})

type BannerPhotoUploadButtonProps = {
   handleUploadBannerPhoto: (photos: File) => Promise<void>
   loading: boolean
   disabled?: boolean
}

export const ProfileBannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
   loading,
   handleUploadBannerPhoto,
   disabled,
}) => {
   const { userData } = useAuth()
   const [showDeleteConfirmation, setShowDeleteConfirmation] =
      useState<boolean>(false)

   const {
      trigger: triggerDeleteUserBanner,
      isMutating: isDeletingUserBanner,
   } = useDeleteUserBannerImage(userData.id)

   const options: ProfileImageUploadOptions = {
      imageValidator: userBannerImageValidator,
      allowedFormats: USER_BANNER_IMAGE_SPECS.allowedFormats,
      maxSize: USER_BANNER_IMAGE_SPECS.maxSize,
      imageSrc: userData?.bannerImageUrl,
      cropper: {
         title: "Upload banner image",
         type: "rectangle",
         key: `update-${userData.id}-profile-banner`,
         aspectRatio: 4 / 1,
      },
      menu: {
         id: "profile-avatar-upload-menu",
         uploadImageText: "Upload new banner picture",
         viewImageText: "View current banner picture",
         removeImageText: "Remove banner picture",
         handleRemoveClick: () => setShowDeleteConfirmation(true),
      },
   }

   return (
      <Fragment>
         <ImageUploadButton
            loading={loading}
            handleUploadImage={handleUploadBannerPhoto}
            disabled={disabled}
            options={options}
         />
         <ConfirmDeleteUserImageDialog
            title="Remove banner image?"
            description="Are you sure you want to remove your banner image?"
            triggerDeleteImage={triggerDeleteUserBanner}
            isDeleting={isDeletingUserBanner}
            onClose={() => setShowDeleteConfirmation(false)}
            open={showDeleteConfirmation}
         />
      </Fragment>
   )
}
