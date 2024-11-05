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
   root: {
      display: "flex",
      flexDirection: "column",
      mt: -6,
      ml: 2,
   },
   avatarContainer: {
      position: "relative",
      width: `${LOGO_SIZE}px`,
      height: `${LOGO_SIZE}px`,
   },
   avatar: {
      zIndex: 2,
      width: "100%",
      height: "100%",
      fontSize: "40px",
      fontWeight: 600,
      border: "2px solid white",
   },
   profileImageUploadButton: {
      zIndex: 2,
      position: "absolute",
      bottom: 0,
      right: -3,
      mb: 1.5,
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
         throwOnError: false,
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
      <Box sx={styles.root}>
         <Box sx={styles.avatarContainer}>
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
