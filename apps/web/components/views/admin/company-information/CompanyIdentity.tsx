import React, { useState } from "react"
import { Form, Formik } from "formik"
import { Image, Upload } from "react-feather"
import { Avatar, Button, Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { BaseGroupInfo } from "pages/group/create"

import Styles from "./BaseStyles"
import { FileDropZone } from "components/views/common/FileDropZone"
import { ImageCropperDialog } from "components/views/common/ImageCropperDialog"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import LeftColumn from "./LeftColumn"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import SectionComponent from "./SectionComponent"

type Logo = Pick<BaseGroupInfo, "logoUrl" | "logoFileObj">
type Banner = Pick<Group, "bannerImageUrl">

const CompanyIdentity = () => {
   const { group: company } = useGroup()
   const [imageCropperDialog, setImageCropperDialog] = useState(false)
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const initialValues = {
      logoUrl: company.logoUrl,
      logoFileObj: {} as File,
      bannerImageUrl: company.bannerImageUrl,
   }

   const saveLogoUrl = (newLogoUrl: string) => {
      if (newLogoUrl) {
         groupRepo.updateGroupLogoUrl(company.id, newLogoUrl)
      }
   }

   const saveBannerImageUrl = (bannerImageUrl: string) => {
      try {
         if (bannerImageUrl) {
            groupRepo.updateGroupBannerPhoto(company.id, bannerImageUrl)
            successNotification("Updated successfull")
         }
      } catch (e) {
         errorNotification(e, "An error has occured")
      }
   }

   const handleCloseCropImageDialog = async (resultUrl) => {
      if (resultUrl) {
         saveLogoUrl(resultUrl)
      }
      setImageCropperDialog((prev) => !prev)
   }

   const [title, description] = [
      "Company identity",
      "Choose your brand visuals so that talent can easily recognise you.",
   ]
   return (
      <SectionComponent title={title} description={description}>
         <Formik initialValues={initialValues} onSubmit={() => {}}>
            {({ values, setFieldValue }) => (
               <Form>
                  <Grid container spacing={3}>
                     <Grid item xs={12}>
                        <Typography
                           variant="h4"
                           component="h4"
                           sx={[Styles.section.h4]}
                        >
                           Upload your company profile picture
                        </Typography>
                     </Grid>
                     <Grid item xs={12}>
                        <Typography variant="h5" color="text.secondary">
                           The optimal size for this picture is 1080x1080 pixels
                        </Typography>
                     </Grid>
                     {/* Uploading && Cropping Company logo image */}
                     <ImageCropperDialog
                        title={"Edit company picture"}
                        key={values?.logoFileObj?.name}
                        fileName={values?.logoFileObj?.name}
                        imageSrc={values?.logoUrl}
                        open={imageCropperDialog}
                        handleClose={handleCloseCropImageDialog}
                     />

                     <Grid item xs={12}>
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
                     </Grid>

                     <Grid item xs={12}>
                        <Typography
                           variant="h4"
                           component="h4"
                           sx={[Styles.section.h4]}
                        >
                           Company banner
                        </Typography>
                     </Grid>

                     <Grid item xs={12}>
                        <Typography variant="h5" color="text.secondary">
                           This image is going to be used as the banner on your
                           company page. It can always be changed.
                        </Typography>
                     </Grid>

                     {/* Uploading banner image */}
                     <Grid item xs={12}>
                        <FileDropZone
                           onChange={(acceptedFiles) => {
                              const file = acceptedFiles?.[0]
                              const banner: Banner = {
                                 bannerImageUrl: URL.createObjectURL(file),
                              }

                              setFieldValue(
                                 "bannerImageUrl",
                                 banner.bannerImageUrl
                              )
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
                                 <Box
                                    sx={
                                       Styles.section.companyBannerUploadButton
                                    }
                                 >
                                    <Typography
                                       variant="caption"
                                       sx={
                                          Styles.section
                                             .companyBannerUploadButton.caption
                                       }
                                    >
                                       Upload picture
                                    </Typography>
                                    <Upload />
                                 </Box>
                              </>
                           )}
                        </FileDropZone>
                     </Grid>
                  </Grid>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

export default CompanyIdentity
