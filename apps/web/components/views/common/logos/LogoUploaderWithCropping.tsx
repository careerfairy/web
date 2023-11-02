import { FC, useState } from "react"
import ImageCropperDialog from "../ImageCropperDialog"
import FileUploader from "../FileUploader"
import { sxStyles } from "types/commonTypes"
import useFileUploader from "components/custom-hook/useFileUploader"
import { LOGO_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { getImageDimensionsValidator } from "../FileUploader/validations"
import { Avatar, Box, Stack, Typography } from "@mui/material"
import { Image as ImageIcon } from "react-feather"

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
      width: "100%",
      height: "100%",
      position: "relative",
      cursor: "pointer",
      border: `1px solid #EDE7FD`,
      borderRadius: "50%",
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
   logoUploader: {
      width: "100%",
      height: "100%",
   },
})

const companyLogoValidator = getImageDimensionsValidator({
   maxHeight: LOGO_IMAGE_SPECS.maxHeight,
   maxWidth: LOGO_IMAGE_SPECS.maxWidth,
   minHeight: LOGO_IMAGE_SPECS.minHeight,
   minWidth: LOGO_IMAGE_SPECS.minWidth,
})

type LogoProps = {
   url: string
   dragActive: boolean
}

const Logo: FC<LogoProps> = ({ dragActive, url }) => {
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

type UploaderProps = {
   logoUrl?: string
   handleSubmit: (file: File) => Promise<void>
}

const LogoUploaderWithCropping: FC<UploaderProps> = (props) => {
   const { logoUrl, handleSubmit } = props

   const [logoObjectUrl, setLogoObjectUrl] = useState<string | null>(null)
   const [logoUrlInternal, setLogoUrlInternal] = useState<string | null>(
      logoUrl
   )

   const handleCloseCropImageDialog = () => {
      setLogoObjectUrl(null)
   }

   const setLogo = (file, logoSetter) => {
      const newFile = Array.isArray(file) ? file[0] : file
      logoSetter(URL.createObjectURL(newFile))
   }

   const { fileUploaderProps: logoUploaderProps, dragActive: logoDragActive } =
      useFileUploader({
         acceptedFileTypes: LOGO_IMAGE_SPECS.allowedFormats,
         maxFileSize: LOGO_IMAGE_SPECS.maxSize,
         multiple: false,
         onValidated: (file) => setLogo(file, setLogoObjectUrl),
         customValidations: [companyLogoValidator],
      })

   const handleSubmitLogo = async (file: File) => {
      await handleSubmit(file)
      setLogo(file, setLogoUrlInternal)
   }

   return (
      <>
         {logoObjectUrl ? (
            <ImageCropperDialog
               title={"Edit company picture"}
               fileName={"company-logo"}
               imageSrc={logoObjectUrl}
               open={Boolean(logoObjectUrl)}
               handleClose={handleCloseCropImageDialog}
               onSubmit={handleSubmitLogo}
            />
         ) : null}

         <FileUploader sx={styles.logoUploader} {...logoUploaderProps}>
            <Logo url={logoUrlInternal} dragActive={logoDragActive} />
         </FileUploader>
      </>
   )
}

export default LogoUploaderWithCropping
