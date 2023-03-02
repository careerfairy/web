import { sxStyles } from "../../../../types/commonTypes"
import { useCompanyPage } from "../index"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { placeholderBanner } from "../../../../constants/images"
import BackgroundImage from "../../../views/common/BackgroundImage"
import { Box } from "@mui/material"
import BannerUploadButton from "./BannerUploadButton"

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
})
const BannerIllustration = () => {
   const { group, tabValue, changeTabValue, editMode } = useCompanyPage()

   return (
      <Box sx={styles.imageWrapper}>
         <BackgroundImage
            image={
               getResizedUrl(group.bannerImageUrl, "lg") || placeholderBanner
            }
            opacity={0.8}
            repeat={false}
            className={undefined}
            backgroundImageSx={undefined}
         />
         <Box sx={styles.buttonWrapper}>
            <BannerUploadButton />
         </Box>
      </Box>
   )
}

export default BannerIllustration
