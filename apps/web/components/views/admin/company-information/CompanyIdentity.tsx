import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Form, Formik } from "formik"
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
import { groupRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

type Logo = Pick<BaseGroupInfo, "logoUrl" | "logoFileObj">
type Banner = Pick<Group, "bannerImageUrl">

const CompanyIdentity = () => {
   const { group: company } = useGroup()
   const [imageCropperDialog, setImageCropperDialog] = useState(false)

   const initialValues = {
      logoUrl: company.logoUrl,
      logoFileObj: company.logoFileObj,
      bannerImageUrl: company.bannerImageUrl,
   } as Logo & Banner

   const saveLogoUrl = (newLogoUrl: string) => {
      if (newLogoUrl) {
         groupRepo.updateGroupLogoUrl(company.id, newLogoUrl)
      }
   }

   const saveBannerImageUrl = (bannerImageUrl: string) => {
      if (bannerImageUrl) {
         groupRepo.updateGroupBannerPhoto(company.id, bannerImageUrl)
      }
   }

   const handleCloseCropImageDialog = async (resultUrl) => {
      if (resultUrl) {
         saveLogoUrl(resultUrl)
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
         <Formik initialValues={initialValues} onSubmit={() => {}}>
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
               <Form>
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
                     key={values?.logoFileObj?.name}
                     fileName={values?.logoFileObj?.name}
                     imageSrc={values?.logoUrl}
                     open={imageCropperDialog}
                     handleClose={handleCloseCropImageDialog}
                  />
                  <FileDropZone
                     onChange={(acceptedFiles) => {
                        const file = acceptedFiles?.[0]
                        const logo: Logo = {
                           logoUrl: URL.createObjectURL(file),
                           logoFileObj: file,
                        }

                        setFieldValue("logoUrl", logo.logoUrl)
                        setFieldValue("logoFileObj", logo.logoFileObj)
                        setImageCropperDialog(true)
                     }}
                  >
                     <Button sx={Styles.section.companyLogoUploadButton}>
                        {Boolean(values.logoUrl) ? (
                           <Avatar
                              alt="Company Logo"
                              src={values.logoUrl}
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
                     onChange={(acceptedFiles) => {
                        const file = acceptedFiles?.[0]
                        const banner: Banner = {
                           bannerImageUrl: URL.createObjectURL(file),
                        }

                        setFieldValue("bannerImageUrl", banner.bannerImageUrl)
                        saveBannerImageUrl(banner.bannerImageUrl)
                     }}
                     sx={(theme) =>
                        Styles.section.companyBannerUploadArea(
                           theme,
                           values.bannerImageUrl
                        )
                     }
                     label={values.bannerImageUrl ? "" : "Upload picture"}
                  >
                     {!Boolean(values.bannerImageUrl) && (
                        <>
                           <Typography
                              variant="caption"
                              sx={Styles.section.caption}
                           >
                              Recommended size: 2880x576px
                           </Typography>
                           <Box sx={Styles.section.companyBannerUploadButton}>
                              <Typography
                                 variant="caption"
                                 sx={
                                    Styles.section.companyBannerUploadButton
                                       .caption
                                 }
                              >
                                 Upload picture
                              </Typography>
                              <Upload />
                           </Box>
                        </>
                     )}
                  </FileDropZone>
               </Form>
            )}
         </Formik>
      </Box>
   )
}

export default CompanyIdentity
