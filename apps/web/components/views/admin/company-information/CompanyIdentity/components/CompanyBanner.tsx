import FileUploader from "components/views/common/FileUploader"
import { FC, useMemo } from "react"
import Hover from "../../components/Hover"
import { Box, Button, Typography } from "@mui/material"
import { Upload, Image } from "react-feather"
import { sxStyles } from "types/commonTypes"

type Props = {
   bannerImageUrl: string
   handleChange?: (file: File) => void
}

const styles = sxStyles({
   hover: {
      display: "contents",
      width: "100%",
      padding: "none",
      margin: 0,
      gap: 0,
      color: "#9999B1",
      leadingTrim: "both",
      textEdge: "cap",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.154px",
      ":hover": {
         textTransform: "none",
         backgroundColor: "transparent",
      },
   },
   companyBannerUploadArea: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      height: "124px",
      flexShrink: 0,
      borderRadius: "4px",
      border: "1px solid var(--tertiary-e, #EDE7FD)",
      background: "#F7F8FC",
      marginY: "10px",
      backgroundSize: "cover",
      backgroundPosition: "right",
      margin: "0px",
      /* Typograph */
      color: "#9999B1",
      fontFamily: "Poppins",
      fontSize: "12px",
      fontStyle: "normal",
      fontWeight: 300,
      lineHeight: "16px",
      textTransform: "none",
   },
   uploadPictureButton: {
      display: "flex",
      padding: "8px 16px",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      borderRadius: "53px",
      border: "1px solid #6749EA",
      color: "#6749EA",
      fill: "#6749EA",
   },
})

const CompanyBanner: FC<Props> = ({ bannerImageUrl, handleChange }) => {
   const hasBannerImage = Boolean(bannerImageUrl)
   const defaultComponent = useMemo(() => {
      return hasBannerImage ? (
         <Box
            sx={{
               ...styles.companyBannerUploadArea,
               background: `url(${bannerImageUrl}), lightgray 50% / cover no-repeat`,
            }}
         ></Box>
      ) : (
         <Box
            sx={{
               ...styles.companyBannerUploadArea,
               bannerImageUrl,
            }}
         >
            <Typography>Recommended size: 2880x576px</Typography>
            <Button sx={styles.uploadPictureButton}>
               <Typography variant="body1" sx={{ textTransform: "none" }}>
                  Upload picture
               </Typography>
               <Upload />
            </Button>
         </Box>
      )
   }, [hasBannerImage, bannerImageUrl])

   return (
      <FileUploader sx={{ width: "100%" }} handleChange={handleChange}>
         {hasBannerImage ? (
            <Hover
               sx={styles.hover}
               DefaultComponent={defaultComponent}
               HoverComponent={
                  <Box
                     sx={{
                        ...styles.companyBannerUploadArea,
                        bannerImageUrl,
                     }}
                  >
                     <Image />
                     <Typography variant="body1" sx={{ textTransform: "none" }}>
                        Change company picture
                     </Typography>
                  </Box>
               }
            />
         ) : (
            defaultComponent
         )}
      </FileUploader>
   )
}

export default CompanyBanner
