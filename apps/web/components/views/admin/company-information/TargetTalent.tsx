import React, { useCallback, useMemo, useState } from "react"
import { Button, Container, Grid, Stack, Typography } from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { BaseGroupInfo } from "pages/group/create"
import { Formik } from "formik"
import * as yup from "yup"
import SaveChangesButton from "./SaveChangesButton"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

const TargetTalent = () => {
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
      <Box
         sx={{ display: "flex", flexDirection: "row", flex: 1 }}
         width={"-webkit-fill-available"}
      >
         <Box sx={{ width: "400px", mr: "16px" }}>
            <Typography sx={{ fontSize: "24px", fontWeight: 600, mb: "12px" }}>
               Target talent
            </Typography>
            <Typography
               sx={{ fontSize: "16px", fontWeight: 400, color: "#5F5F5F" }}
            >
               Tell us which talent you’re targeting so that we can present them
               your content.
            </Typography>
         </Box>
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
               <Stack
                  direction={"column"}
                  sx={{ gap: "12px" }}
                  width={"-webkit-fill-available"}
               >
                  <BrandedTextField
                     label="Targeted countries"
                     select
                     placeholder="Select your targeted countries"
                  ></BrandedTextField>
                  <BrandedTextField
                     label="Targeted universities"
                     placeholder="Select your targeted universities"
                     select
                  ></BrandedTextField>
                  <BrandedTextField
                     label="Targeted fields of study"
                     placeholder="Select your targeted fields of study"
                     select
                  ></BrandedTextField>
                  <SaveChangesButton />
               </Stack>
            )}
         </Formik>
      </Box>
   )
}

export default TargetTalent
