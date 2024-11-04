import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFirebaseUpload from "components/custom-hook/useFirebaseUpload"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import ColorizedAvatar from "components/views/common/ColorizedAvatar"
import { userRepo } from "data/RepositoryInstances"
import useSWRMutation from "swr/mutation"
import { sxStyles } from "types/commonTypes"
import { v4 as uuid } from "uuid"
import { ProfileImageUploadButton } from "./ProfileImageUploadButton"

const LOGO_SIZE = 104

const styles = sxStyles({
   avatar: {
      ml: 2,
      width: `${LOGO_SIZE}px`,
      height: `${LOGO_SIZE}px`,
      fontSize: "40px",
      fontWeight: 600,
      position: "absolute",
      top: {
         xs: "111px",
         sm: "120px",
         md: "320px",
      },
      border: "2px solid white",
   },
   profileImageUploadButton: {
      position: "absolute",
      ml: 11,
      mt: "6px",
   },
})

export const ProfileAvatar = () => {
   const { userData, userPresenter } = useAuth()

   const [uploadFile, , isUploading] = useFirebaseUpload()

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `update-profile-${userData.id}-avatar-image`,
      handleUpdateAvatarImage,
      {
         onSuccess: () => {
            successNotification(
               "Profile avatar image has been successfully updated"
            )
         },
         onError: (err) => {
            errorNotification(err.message)
         },
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above.
      }
   )

   const handleUploadAvatarPhoto = async (photo: File) => {
      const avatarImageId = uuid()

      const downloadURL = await uploadFile(
         photo,
         userPresenter.getUserAvatarImageStoragePath(avatarImageId)
      )

      return trigger({ userId: userData.id, avatarImageUrl: downloadURL })
   }

   return (
      <Box>
         <ColorizedAvatar
            sx={styles.avatar}
            imageUrl={userData?.avatar}
            lastName={userData?.lastName}
            firstName={userData?.firstName}
         />
         <Box sx={styles.profileImageUploadButton}>
            <ProfileImageUploadButton
               disabled={isUploading || isMutating}
               handleUploadAvatarPhoto={handleUploadAvatarPhoto}
               loading={isUploading || isMutating}
            />
         </Box>
      </Box>
   )
}

type Arguments = {
   userId: string
   avatarImageUrl: string
}

const handleUpdateAvatarImage = (
   _: string,
   { arg: { avatarImageUrl, userId } }: { arg: Arguments }
) => userRepo.updateAdditionalInformation(userId, { avatar: avatarImageUrl })
