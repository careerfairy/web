import React, { FC, ReactNode, useEffect, useState } from "react"
import { Form, Formik } from "formik"
import { Image } from "react-feather"
import { Avatar, Button, Grid, Stack, Typography, Fade } from "@mui/material"
import { BaseGroupInfo } from "pages/group/create"

import Styles from "../BaseStyles"
import { FileDropZone } from "components/views/common/FileDropZone"
import { ImageCropperDialog } from "components/views/common/ImageCropperDialog"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"
import { useGroup } from "layouts/GroupDashboardLayout"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import SectionComponent from "../SectionComponent"
import { sxStyles } from "types/commonTypes"
import CompanyBanner from "./components/CompanyBanner"
import Hover from "../components/Hover"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useDispatch } from "react-redux"
import * as actions from "store/actions"

const styles = sxStyles({
   imageLabel: {
      display: "block",
      color: "#9999B1",
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "12px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "141%",
      justifyContent: "center",
   },
   bannerImageLabel: {
      width: "620px",
      height: "124px",
      flexShrink: 0,
      borderRadius: "4px",
      border: "1px solid var(--Tertiary-E, #EDE7FD)",
      background:
         "linear-gradient(0deg, rgba(247, 248, 252, 0.96) 0%, rgba(247, 248, 252, 0.96) 100%), url(<path-to-image>), lightgray 50% / cover no-repeat",
   },
   profilePictureHover: {
      width: "140px",
      height: "140px",
      flexShrink: 0,
      borderRadius: "91px",
      border: "1px solid var(--Tertiary-E, #EDE7FD)",
      background:
         "linear-gradient(0deg, rgba(247, 248, 252, 0.96) 0%, rgba(247, 248, 252, 0.96) 100%), url(<path-to-image>), lightgray 9.982px 8.353px / 86.615% 86.615% no-repeat, #FFF",
   },
   companyLogoUploadButton: {
      width: "140px",
      height: "140px",
      flexShrink: 0,
      borderRadius: "91px",
      border: "1px solid var(--tertiary-e, #EDE7FD)",
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
         fontFamily: "Poppins",
         fontSize: "12px",
         fontStyle: "normal",
         fontWeight: 400,
         lineHeight: "141%",
      },
   },
})

type Logo = Pick<BaseGroupInfo, "logoUrl" | "logoFileObj">
type Banner = Pick<Group, "bannerImageUrl">

const CompanyIdentity: FC = () => {
   const { group: company } = useGroup()
   const [imageCropperDialog, setImageCropperDialog] = useState(false)
   const [bannerChanged, setBannerChanged] = useState(false)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const firebase = useFirebaseService()
   const dispatch = useDispatch()

   const [initialValues, setInitialValues] = useState({
      logoUrl: company.logoUrl,
      logoFileObj: {} as File,
      bannerImageUrl: company.bannerImageUrl,
   })

   useEffect(() => {}, [imageCropperDialog, bannerChanged])

   const saveLogoUrl = (newLogoUrl: string) => {
      if (newLogoUrl) {
         groupRepo.updateGroupLogoUrl(company.id, newLogoUrl)
      }
   }

   const blobUrlToDataUrl = async (blob) => {
      try {
         // Step 2: Read the blob as a Data URL
         return new Promise((resolve, reject) => {
            let reader = new FileReader()
            reader.onloadend = function () {
               resolve(reader.result) // This is the Data URL
            }
            reader.onerror = function () {
               reject(new Error("Failed to read blob as Data URL."))
            }
            reader.readAsDataURL(blob)
         })
      } catch (error) {
         debugger
         console.error(
            "There was an error converting the blob URL to a data URL",
            error
         )
         throw error // Re-throw so the caller can handle or see the error
      }
   }

   const uploadImage = async (file: File) => {
      try {
         const b64Encoded = await blobUrlToDataUrl(file)
         // Converting cropped 64 based encoded string to a File
         const newFileObject = dataURLtoFile(b64Encoded)
         // Getting the storage instance
         const storageRef = firebase.getStorageRef()
         // Setting up the storage file path
         const fullPath = `group-banner/${newFileObject?.name}`
         const companyLogoRef = storageRef.child(fullPath)
         const uploadTask = companyLogoRef.put(newFileObject)
         await uploadTask.then()
         return uploadTask.snapshot.ref.getDownloadURL()
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
         errorNotification(e, "An error has occured")
      }
   }

   const saveBannerImageUrl = async (bannerImageUrl: File) => {
      try {
         if (bannerImageUrl) {
            const url = await uploadImage(bannerImageUrl)
            debugger
            if (!url) throw new Error("Upload error")
            await groupRepo.updateGroupBannerPhoto(company.id, url)
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
      setInitialValues((prev) => ({ ...prev, logoUrl: resultUrl }))
      setImageCropperDialog((prev) => !prev)
   }

   const [title, description] = [
      "Company identity",
      "Choose your brand visuals so that talent can easily recognise you.",
   ]
   return (
      <SectionComponent title={title} description={description}>
         <Formik
            initialValues={initialValues}
            onSubmit={() => {}}
            enableReinitialize
         >
            {({ values, setFieldValue }) => (
               <Form>
                  <Grid container spacing={3}>
                     <Grid item xs={12}>
                        <Typography sx={[Styles.section.h4]}>
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
                           {Boolean(values.logoUrl) ? (
                              <Hover
                                 sx={styles.profilePictureHover}
                                 DefaultComponent={
                                    <Avatar
                                       alt="Company Logo"
                                       src={values.logoUrl}
                                       sx={{ width: 140, height: 140 }}
                                    />
                                 }
                                 HoverComponent={
                                    <Stack sx={styles.imageLabel}>
                                       <Image />
                                       <Typography
                                          variant="body1"
                                          sx={{ textTransform: "none" }}
                                       >
                                          Change company picture
                                       </Typography>
                                    </Stack>
                                 }
                              />
                           ) : (
                              <Button sx={styles.companyLogoUploadButton}>
                                 <Stack sx={styles.imageLabel}>
                                    <Image />
                                    <Typography>
                                       Upload company picture
                                    </Typography>
                                 </Stack>
                              </Button>
                           )}
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
                        <CompanyBanner
                           bannerImageUrl={values.bannerImageUrl}
                           handleChange={async (file: File) => {
                              await saveBannerImageUrl(file)
                              setBannerChanged(true)
                           }}
                        />
                     </Grid>
                  </Grid>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

export default CompanyIdentity
