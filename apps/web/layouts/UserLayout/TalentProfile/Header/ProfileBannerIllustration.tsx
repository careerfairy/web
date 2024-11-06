import { Box, LinearProgress } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFirebaseUpload from "components/custom-hook/useFirebaseUpload"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { profilePlaceholderBanner } from "constants/images"
import { userRepo } from "data/RepositoryInstances"
import Image from "next/image"
import useSWRMutation from "swr/mutation"
import { sxStyles } from "types/commonTypes"
import { v4 as uuid } from "uuid"
import { ProfileBannerUploadButton } from "./ProfileBannerUploadButton"

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "94px", md: "auto" },
      position: "relative",
      paddingTop: "25%",
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
      mt: {
         xs: "90px",
         sm: "90px",
         md: 1,
      },
   },
   backgroundImage: {
      borderRadius: "12px 12px 0px 0px",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
   },
   backgroundImageWrapper: {
      borderRadius: "12px 12px 0px 0px",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      "&::before": {
         content: '""',
         position: "absolute",
         top: 0,
         left: 0,
         width: "100%",
         height: "100%",
         backgroundColor: "rgba(0, 0, 0, 0.3)", // Adjust opacity for darkness
         zIndex: 1,
      },
   },
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
         <Box sx={styles.backgroundImageWrapper}>
            <Image
               src={userData.bannerImageUrl || profilePlaceholderBanner}
               alt="Profile banner image"
               fill
               style={{
                  objectFit: "cover",
               }}
            />
         </Box>
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
