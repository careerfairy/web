import { Box, LinearProgress } from "@mui/material"
import { placeholderBanner } from "../../../../constants/images"
import { sxStyles } from "../../../../types/commonTypes"
import useUploadGroupBanner from "../../../custom-hook/group/useUploadGroupBanner"
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

   const { 
      handleUploadImage: handleUploadBannerPhoto, 
      isLoading: isMutating,
      progress: uploadProgress,
      uploading: isUploading
   } = useUploadGroupBanner(group.id)

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



export default BannerIllustration
