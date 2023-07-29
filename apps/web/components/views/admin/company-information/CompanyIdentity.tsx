import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Formik } from "formik"
import * as yup from "yup"
import { Image, Upload } from "react-feather"
import { Avatar, Button, Typography } from "@mui/material"
import { Box } from "@mui/system"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { BaseGroupInfo } from "pages/group/create"

import Styles from "./BaseStyles"
import { FileDropZone } from "components/views/common/FileDropZone"
import { ImageCropperDialog } from "components/views/common/ImageCropperDialog"
import { Group } from "@careerfairy/shared-lib/groups"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

type Logo = Pick<BaseGroupInfo, "logoUrl" | "logoFileObj">
type Banner = Pick<Group, "bannerImageUrl">

const CompanyIdentity = () => {
   const [companyLogo, setCompanyLogo] = useState({} as Logo)

   const [companyBanner, setCompanyBanner] = useState({} as Banner)

   const [imageCropperDialog, setImageCropperDialog] = useState(false)
   const initialValues = useMemo(
      () => ({
         logoUrl: companyLogo.logoUrl || "",
         logoFileObj: companyLogo.logoFileObj || null,
      }),
      [companyLogo.logoUrl, companyLogo.logoFileObj]
   )

   const handleSubmit = useCallback(
      (values, { setSubmitting }) => {
         let logo: Logo = {
            logoUrl: values.logoUrl,
            logoFileObj: values.logoFileObj || companyLogo.logoFileObj,
         }
         setCompanyLogo(logo)
         setSubmitting(false)
      },
      [companyLogo.logoUrl, companyLogo?.logoFileObj]
   )

   const handleLogoUpload = (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      const logo: Logo = {
         logoUrl: file.preview,
         logoFileObj: file,
      }

      setCompanyLogo(logo)
      setImageCropperDialog(true)
   }

   const handleBannerImageUpload = (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      const banner: Banner = {
         bannerImageUrl: file.preview,
      }

      setCompanyBanner(banner)
   }

   const handleCloseCropImageDialog = async (resultUrl) => {
      if (resultUrl) {
         const logo: Logo = {
            logoUrl: resultUrl,
            logoFileObj: companyLogo.logoFileObj,
         }
         setCompanyLogo(logo)
      }
      setImageCropperDialog((prev) => !prev)
   }

   return (
      <Box sx={Styles.section}>
         <div className="section-left_column">
            <h3>Company identity</h3>
            <p>
               Choose your brand visuals so that talent can easily recognise
               you.
            </p>
         </div>
         <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
         >
            {({
               values,
               errors,
               touched,
               handleChange,
               handleBlur,
               handleSubmit,
               isSubmitting,
               setFieldValue,
               setFieldError,
            }) => (
               <Box component={"form"}>
                  <div>
                     <Typography
                        variant="h4"
                        component="h4"
                        sx={[Styles.section.h4]}
                     >
                        Upload your company profile picture
                     </Typography>
                     <Typography variant="h5" color="text.secondary">
                        The optimal size for this picture is 1080x1080 pixels
                     </Typography>
                     {/* Uploading && Cropping Company logo image */}
                     <ImageCropperDialog
                        title={"Edit company picture"}
                        key={companyLogo?.logoFileObj?.name}
                        fileName={companyLogo?.logoFileObj?.name}
                        imageSrc={companyLogo?.logoUrl}
                        open={imageCropperDialog}
                        handleClose={handleCloseCropImageDialog}
                     />
                     <FileDropZone onChange={handleLogoUpload}>
                        <Button sx={Styles.section.companyLogoUploadButton}>
                           {Boolean(companyLogo.logoUrl) ? (
                              <Avatar
                                 alt="Company Logo"
                                 src={companyLogo.logoUrl}
                                 sx={{ width: 140, height: 140 }}
                              />
                           ) : (
                              <>
                                 <Image />
                                 <Typography variant="button">
                                    Upload company picture
                                 </Typography>
                              </>
                           )}
                        </Button>
                     </FileDropZone>
                     <Typography
                        variant="h4"
                        component="h4"
                        sx={[Styles.section.h4]}
                     >
                        Company banner
                     </Typography>
                     <Typography variant="h5" color="text.secondary">
                        This image is going to be used as the banner on your
                        company page. It can always be changed.
                     </Typography>
                     {/* Uploading banner image */}
                     <FileDropZone
                        onChange={handleBannerImageUpload}
                        sx={(theme) =>
                           Styles.section.companyBannerUploadArea(
                              theme,
                              companyBanner.bannerImageUrl
                           )
                        }
                     >
                        {!Boolean(companyBanner.bannerImageUrl) && (
                           <>
                              <Typography
                                 variant="caption"
                                 sx={Styles.section.caption}
                              >
                                 Recommended size: 2880x576px
                              </Typography>
                              <Box
                                 sx={Styles.section.companyBannerUploadButton}
                              >
                                 <Typography
                                    variant="caption"
                                    sx={
                                       Styles.section.companyBannerUploadButton
                                          .caption
                                    }
                                 >
                                    {companyBanner.bannerImageUrl ??
                                       "Upload picture"}
                                 </Typography>
                                 <Upload />
                              </Box>
                           </>
                        )}
                     </FileDropZone>
                  </div>
               </Box>
            )}
         </Formik>
      </Box>
   )
}

export default CompanyIdentity
