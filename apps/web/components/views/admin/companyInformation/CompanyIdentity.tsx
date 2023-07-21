import React, { useCallback, useMemo, useState } from "react"
import { Button, Container, Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./styles"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { BaseGroupInfo } from "pages/group/create"
import { Formik } from "formik"
import * as yup from "yup"
import { Image, Upload } from "react-feather"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

const CompanyIdentity = () => {
   const [companyLogo, setCompanyLogo] = useState(
      {} as Pick<BaseGroupInfo, "logoUrl" | "logoFileObj">
   )
   const initialValues = useMemo(
      () => ({
         logoUrl: companyLogo.logoUrl || "",
         logoFileObj: companyLogo.logoFileObj || null,
      }),
      [companyLogo.logoUrl, companyLogo.logoFileObj]
   )
   const handleSubmit = useCallback(
      (values, { setSubmitting }) => {
         let logo: Pick<BaseGroupInfo, "logoUrl" | "logoFileObj"> = {
            logoUrl: values.logoUrl,
            logoFileObj: values.logoFileObj || companyLogo.logoFileObj,
         }
         setCompanyLogo(logo)
         setSubmitting(false)
      },
      [companyLogo?.logoFileObj, setCompanyLogo]
   )
   return (
      <Box sx={Styles.section}>
         <div>
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
               <>
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

                     <FilePickerContainer
                        extensions={["jpg", "jpeg", "png"]}
                        maxSize={20}
                        onBlur={handleBlur}
                        onChange={(fileObject) => {
                           setFieldValue(
                              "logoUrl",
                              URL.createObjectURL(fileObject),
                              true
                           )
                           setFieldValue("logoFileObj", fileObject, true)
                        }}
                        onError={(errMsg) =>
                           setFieldError("logoFileObj", errMsg)
                        }
                     >
                        <Box
                           component="button"
                           sx={Styles.section.companyLogoUploadButton}
                        >
                           <Image />
                           <Typography
                              variant="caption"
                              sx={Styles.section.caption}
                           >
                              {values.logoFileObj || companyLogo.logoFileObj
                                 ? "Change"
                                 : "Upload company picture"}
                           </Typography>
                        </Box>
                     </FilePickerContainer>
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
                     <FilePickerContainer
                        extensions={["jpg", "jpeg", "png"]}
                        maxSize={20}
                        onBlur={handleBlur}
                        onChange={(fileObject) => {
                           setFieldValue(
                              "logoUrl",
                              URL.createObjectURL(fileObject),
                              true
                           )
                           setFieldValue("logoFileObj", fileObject, true)
                        }}
                        onError={(errMsg) =>
                           setFieldError("logoFileObj", errMsg)
                        }
                     >
                        <Box
                           component="button"
                           sx={Styles.section.companyBannerUploadArea}
                        >
                           <Typography
                              variant="caption"
                              sx={Styles.section.caption}
                           >
                              {values.logoFileObj || companyLogo.logoFileObj
                                 ? "Change"
                                 : "Recommended size: 2880x576px"}
                           </Typography>
                           <Box
                              component="button"
                              sx={Styles.section.companyBannerUploadButton}
                           >
                              <Typography
                                 variant="caption"
                                 sx={
                                    Styles.section.companyBannerUploadButton
                                       .caption
                                 }
                              >
                                 {values.logoFileObj || companyLogo.logoFileObj
                                    ? "Change"
                                    : "Upload picture"}
                              </Typography>
                              <Upload />
                           </Box>
                        </Box>
                     </FilePickerContainer>
                  </div>
               </>
            )}
         </Formik>
      </Box>
   )
}

export default CompanyIdentity
