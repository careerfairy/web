import { Box, LinearProgress } from "@mui/material"
import useSWRMutation from "swr/mutation"
import { v4 as uuid } from "uuid"
import { placeholderBanner } from "../../../../constants/images"
import { groupRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import useFirebaseUpload from "../../../custom-hook/useFirebaseUpload"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import BackgroundImage from "../../../views/common/BackgroundImage"
import { useCompanyPage } from "../index"
import BannerUploadButton from "./BannerUploadButton"

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "94px", md: "194px" },
      position: "relative",
      "& .banner-image": {
         borderRadius: "12px 12px 0 0",
      },
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
   },
})
const BannerIllustration = () => {
   const { group, groupPresenter, editMode } = useCompanyPage()

   const [uploadFile, uploadProgress, isUploading] = useFirebaseUpload()

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { trigger, isMutating } = useSWRMutation(
      `update-group-${group.id}-banner-image`,
      handleUpdateBannerImage,
      {
         onSuccess: () => {
            successNotification("Banner image has been successfully updated")
         },
         onError: (err) => {
            errorNotification(err.message)
         },
         throwOnError: false, // We don't want to throw an error, we want to handle it ourselves in the onError callback above
      }
   )

   const handleUploadBannerPhoto = async (photo: File) => {
      const bannerImageId = uuid()
      const downloadURL = await uploadFile(
         photo,
         groupPresenter.getGroupBannerStorageImagePath(bannerImageId)
      )
      return trigger({ groupId: group.id, bannerImageUrl: downloadURL })
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
               getResizedUrl(group.bannerImageUrl, "lg") || placeholderBanner
            }
            opacity={0.8}
            repeat={false}
            className={"banner-image"}
            backgroundImageSx={undefined}
         />
         <Box sx={styles.buttonWrapper}>
            {editMode ? (
               <BannerUploadButton
                  disabled={isUploading || isMutating}
                  handleUploadBannerPhoto={handleUploadBannerPhoto}
                  loading={isUploading || isMutating}
               />
            ) : null}
         </Box>
      </Box>
   )
}

type Arguments = {
   groupId: string
   bannerImageUrl: string
}

const handleUpdateBannerImage = (
   _: string,
   { arg: { bannerImageUrl, groupId } }: { arg: Arguments }
) => groupRepo.updateGroupBannerPhoto(groupId, bannerImageUrl)

export default BannerIllustration
