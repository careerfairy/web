import { Avatar, Box, Stack, Typography } from "@mui/material"
import useUploadGroupLogo from "components/custom-hook/group/useUploadGroupLogo"
import useFileUploader from "components/custom-hook/useFileUploader"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import FileUploader from "components/views/common/FileUploader"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import ImageCropperDialog from "components/views/common/ImageCropperDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback, useState } from "react"
import { Image as ImageIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"
import Styles from "./BaseStyles"
import CompanyBanner from "./CompanyBanner"
import SectionComponent from "./SectionComponent"
import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"

const styles = sxStyles({
   companyLogo: {
      "&:hover": {
         "& .MuiAvatar-root": {
            opacity: 0,
         },
         "& .change-image-label": {
            opacity: 1,
         },
      },
      width: 140,
      height: 140,
      position: "relative",
      cursor: "pointer",
   },
   companyLogoAvatar: {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
   },
   imageLabel: {
      color: "#9999B1",
      display: "flex",
      textAlign: "center",
      fontSize: "0.857rem",
      lineHeight: "141%",
      justifyContent: "center",
      alignItems: "center",
      opacity: 0,
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      transition: (theme) => theme.transitions.create("opacity"),
      border: `1px solid #EDE7FD`,
      borderRadius: "50%",
      background: "#F7F8FC",
   },
   imageLabelVisible: {
      "& .MuiAvatar-root": {
         opacity: 0,
      },
      "& .change-image-label": {
         opacity: 1,
      },
   },
   bannerImageLabel: {
      width: "620px",
      height: "124px",
      flexShrink: 0,
      borderRadius: 1,
      border: "1px solid #EDE7FD",
      background:
         "linear-gradient(0deg, rgba(247, 248, 252, 0.96) 0%, rgba(247, 248, 252, 0.96) 100%), url(<path-to-image>), lightgray 50% / cover no-repeat",
   },
   profilePictureHover: {
      width: "140px",
      height: "140px",
      flexShrink: 0,
      borderRadius: "91px",
      border: "1px solid #EDE7FD",
      background:
         "linear-gradient(0deg, rgba(247, 248, 252, 0.96) 0%, rgba(247, 248, 252, 0.96) 100%), url(<path-to-image>), lightgray 9.982px 8.353px / 86.615% 86.615% no-repeat, #FFF",
   },
   companyLogoUploadButton: {
      width: "140px",
      height: "140px",
      flexShrink: 0,
      borderRadius: "91px",
      border: "1px solid #EDE7FD",
      background: "#F7F8FC",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginY: "10px",
      textTransform: "none",
      svg: {
         color: "#9999B1",
         width: "36px",
         height: "36px",
      },
      ".MuiTypography-button": {
         color: "#9999B1",
         textAlign: "center",
         fontSize: "12px",
         fontStyle: "normal",
         fontWeight: 400,
         lineHeight: "141%",
      },
   },
})

const [title, description] = [
   "Company identity",
   "Choose your brand visuals so that talent can easily recognise you.",
]

const companyLogoValidator = getImageDimensionsValidator({
   maxHeight: 2160,
   maxWidth: 2160,
   minHeight: 100,
   minWidth: 100,
})

const CompanyIdentity: FC = () => {
   const { group, groupPresenter } = useGroup()

   const { handleUploadImage: handleUploadLogo } = useUploadGroupLogo(group.id)

   const [groupLogoObjectUrl, setGroupLogoObjectUrl] = useState<string | null>(
      null
   )

   const { fileUploaderProps: logoUploaderProps, dragActive: logoDragActive } =
      useFileUploader({
         acceptedFileTypes: BANNER_IMAGE_SPECS.allowedFormats,
         maxFileSize: 10, // MB
         multiple: false,
         onValidated: (file) => {
            const newFile = Array.isArray(file) ? file[0] : file
            setGroupLogoObjectUrl(URL.createObjectURL(newFile))
         },
         customValidations: [companyLogoValidator],
      })

   const { successNotification, errorNotification } = useSnackbarNotifications()

   const handleCloseCropImageDialog = () => {
      setGroupLogoObjectUrl(null)
   }

   const handleSubmitLogo = useCallback(
      async (file: File) => {
         try {
            await handleUploadLogo(file)
            successNotification("Updated successfull")
         } catch (e) {
            errorNotification(e, e)
         }
      },
      [errorNotification, handleUploadLogo, successNotification]
   )

   return (
      <SectionComponent title={title} description={description}>
         <Stack spacing={1.5}>
            <Stack spacing={1.25}>
               <span>
                  <Typography
                     component="h4"
                     gutterBottom
                     sx={[Styles.section.h4]}
                  >
                     Upload your company profile picture
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                     The optimal size for this picture is 1080x1080 pixels
                  </Typography>
               </span>
               {/* Uploading && Cropping Company logo image */}
               {groupLogoObjectUrl ? (
                  <ImageCropperDialog
                     title={"Edit company picture"}
                     fileName={"company-logo"}
                     imageSrc={groupLogoObjectUrl}
                     open={Boolean(groupLogoObjectUrl)}
                     handleClose={handleCloseCropImageDialog}
                     onSubmit={handleSubmitLogo}
                  />
               ) : null}

               <FileUploader {...logoUploaderProps}>
                  <CompanyLogo
                     url={groupPresenter.getCompanyLogoUrl()}
                     dragActive={logoDragActive}
                  />
               </FileUploader>
            </Stack>

            <Stack spacing={1.25}>
               <span>
                  <Typography
                     component="h4"
                     gutterBottom
                     sx={[Styles.section.h4]}
                  >
                     Company banner
                  </Typography>

                  <Typography variant="h5" color="text.secondary">
                     This image is going to be used as the banner on your
                     company page. It can always be changed.
                  </Typography>
               </span>

               {/* Uploading banner image */}
               <CompanyBanner
                  url={groupPresenter.getCompanyBannerUrl()}
                  groupId={group.id}
               />
            </Stack>
         </Stack>
      </SectionComponent>
   )
}

type CompanyLogoProps = {
   url: string
   dragActive: boolean
}

const CompanyLogo: FC<CompanyLogoProps> = ({ dragActive, url }) => {
   return (
      <Box
         sx={[
            styles.companyLogo,
            (dragActive || !url) && styles.imageLabelVisible,
         ]}
      >
         <Stack sx={styles.imageLabel} className="change-image-label">
            <ImageIcon />
            <Typography variant="body1">
               {url ? "Change company picture" : "Upload company picture"}
            </Typography>
         </Stack>
         <Avatar sx={styles.companyLogoAvatar} alt="Company Logo" src={url} />
      </Box>
   )
}

export default CompanyIdentity
