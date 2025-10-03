import { Box } from "@mui/material"
import BannerImageSelect from "components/views/group/admin/events/detail/form/views/general/components/BannerImageSelect"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   bannerContainer: {
      aspectRatio: "3 / 2",
      height: "auto !important", // Override the fixed height
   },
   bannerImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
   },
})

export const OfflineEventBannerImageSelect = () => {
   return (
      <Box>
         <BannerImageSelect
            fieldName="general.backgroundImageUrl"
            emptyBannerLabel="Upload your event banner image"
            recommendedSizeLabel="Recommended size: 1920x1280"
            withCropper
            cropperConfig={{
               title: "Upload event banner image",
               type: "rectangle",
               aspectRatio: 3 / 2,
               cropBoxResizable: true,
               key: "offline-event-banner-cropper",
            }}
            containerStyles={styles.bannerContainer}
            bannerImageStyles={styles.bannerImage}
         />
      </Box>
   )
}
