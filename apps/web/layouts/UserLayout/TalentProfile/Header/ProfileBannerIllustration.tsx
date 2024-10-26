import { Box, LinearProgress } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFirebaseUpload from "components/custom-hook/useFirebaseUpload"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import BackgroundImage from "components/views/common/BackgroundImage"
import { profilePlaceholderBanner } from "constants/images"
import { userRepo } from "data/RepositoryInstances"
import useSWRMutation from "swr/mutation"
import { sxStyles } from "types/commonTypes"
import { v4 as uuid } from "uuid"
import { ProfileBannerUploadButton } from "./ProfileBannerUploadButton"

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "250px", md: "300px" },
      position: "relative",
   },
   buttonWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      px: 3,
      py: 2,
   },
   progress: {
      zIndex: 1,
      mt: 1,
   },
   backgroundImage: { borderRadius: "12px 12px 0px 0px" },
})
export const ProfileBannerIllustration = () => {
   const { userData, userPresenter } = useAuth()

   const [uploadFile, uploadProgress, isUploading] = useFirebaseUpload()

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `update-profile-${userData.id}-banner-image`,
      handleUpdateBannerImage,
      {
         onSuccess: () => {
            successNotification(
               "Profile banner image has been successfully updated"
            )
         },
         onError: (err) => {
            errorNotification(err.message)
         },
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above.
      }
   )

   const handleUploadBannerPhoto = async (photo: File) => {
      const bannerImageId = uuid()

      const downloadURL = await uploadFile(
         photo,
         userPresenter.getUserBannerImageStoragePath(bannerImageId)
      )

      return trigger({ userId: userData.id, bannerImageUrl: downloadURL })
   }

   return (
      <Box sx={styles.imageWrapper}>
         {isUploading ? (
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={uploadProgress}
            />
         ) : null}
         <BackgroundImage
            image={
               getResizedUrl(userData.bannerImageUrl, "lg") ||
               profilePlaceholderBanner
            }
            repeat={false}
            className={undefined}
            backgroundImageSx={styles.backgroundImage}
         />
         <Box sx={styles.buttonWrapper}>
            <ProfileBannerUploadButton
               disabled={isUploading || isMutating}
               handleUploadBannerPhoto={handleUploadBannerPhoto}
               loading={isUploading || isMutating}
            />
         </Box>
      </Box>
   )
}

type Arguments = {
   userId: string
   bannerImageUrl: string
}

const handleUpdateBannerImage = (
   _: string,
   { arg: { bannerImageUrl, userId } }: { arg: Arguments }
) => userRepo.updateUserData(userId, { bannerImageUrl: bannerImageUrl })
