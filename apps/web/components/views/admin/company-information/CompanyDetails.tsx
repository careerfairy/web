import React, { useCallback, useMemo, useState } from "react"
import {
   Autocomplete,
   Collapse,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import { Box } from "@mui/system"

import BaseStyles from "./BaseStyles"
import { BaseGroupInfo } from "pages/group/create"
import { Form, Formik } from "formik"
import * as yup from "yup"
import { sxStyles } from "types/commonTypes"
import SaveChangesButton from "./SaveChangesButton"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   CompanySizesCodes,
} from "constants/forms"
import MultiListSelect from "components/views/common/MultiListSelect"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { multiListSelectMapValueFn } from "components/views/signup/utils"
import GenericDropdown from "components/views/common/GenericDropdown"
import BrandedMultiCheckBox from "components/views/common/inputs/BrandedMultiCheckBox"
import { useGroup } from "layouts/GroupDashboardLayout"
import { groupRepo } from "data/RepositoryInstances"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

const styles = sxStyles({
   selectBox: {
      color: "#B0B0B0",
      ".MuiOutlinedInput-root": {
         display: "flex",
         padding: "12px 15px",
         flexDirection: "column",
         alignItems: "flex-start",
         gap: "10px",
         alignSelf: "stretch",
         borderRadius: "8px",
         border: "1px solid var(--tertiary-e, #EDE7FD)",
         background: "#F7F8FC",
         color: "#B0B0B0",
         width: "-webkit-fill-available",
      },
   },
})

const CompanyDetails = () => {
   const { group: company } = useGroup()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const initialValues = useMemo(
      () => ({
         companyName: company.universityName,
         companyCountry: company.companyCountry,
         companyIndustries: company.companyIndustries,
         companySize: company.companySize,
         description: company.description,
      }),
      [
         company.universityName,
         company.companyCountry,
         company.companyIndustries,
         company.companySize,
         company.description,
      ]
   )

   const handleSubmit = useCallback(
      async (values) => {
         try {
            const payload = { ...values, universityName: values.companyName }
            await groupRepo.updateGroupMetadata(company.id, payload)

            successNotification("Your data was updated successfully")
         } catch (e) {
            errorNotification(e, "Failed to updated your data")
         }
      },
      [errorNotification, successNotification, company.id]
   )

   return (
      <Box
         sx={{ display: "flex", flexDirection: "row", flex: 1 }}
         width={"-webkit-fill-available"}
      >
         <Box sx={{ width: "400px", mr: "16px" }}>
            <Typography sx={{ fontSize: "24px", fontWeight: 600, mb: "12px" }}>
               Details
            </Typography>
            <Typography
               sx={{ fontSize: "16px", fontWeight: 400, color: "#5F5F5F" }}
            >
               Share information about your company to the next generation of
               talent. This information will be visible on your company profile,
               as well as your live streams, and can be edited at any time.
            </Typography>
         </Box>
         <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={handleSubmit}
         >
            {({
               values,
               errors,
               touched,
               handleChange,
               handleSubmit,
               handleBlur,
               isSubmitting,
               setFieldValue,
               setFieldError,
            }) => (
               <Form>
                  <Stack
                     direction={"column"}
                     sx={{ gap: "12px" }}
                     width={"-webkit-fill-available"}
                  >
                     <BrandedTextField
                        name="companyName"
                        label="Company name"
                        placeholder="Ex: CareerFairy"
                        value={values.companyName}
                        onChange={(e) =>
                           setFieldValue("companyName", e.target.value)
                        }
                     />
                     <BrandedTextField
                        name="companyWebsite"
                        label="Career page URL"
                        placeholder="Ex: company.io/careers"
                     />
                     <BrandedTextField
                        name="description"
                        multiline={true}
                        rows={4}
                        label="Describe your company"
                        placeholder="E.g., Briefly describe your company's mission, products/services, and target audience"
                     />
                     <>
                        <Box>
                           <Autocomplete
                              id={"companyCountry"}
                              options={CompanyCountryValues}
                              defaultValue={values.companyCountry}
                              getOptionLabel={(option) => option.name || ""}
                              value={values.companyCountry}
                              disableClearable
                              onChange={(_, newValue) =>
                                 setFieldValue("companyCountry", newValue)
                              }
                              renderInput={(params) => (
                                 <BrandedTextField
                                    {...params}
                                    label={`Company location`}
                                    error={Boolean(
                                       errors.companyCountry &&
                                          touched.companyCountry
                                    )}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                 />
                              )}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.companyCountry && touched.companyCountry
                              )}
                              style={{ color: "red" }}
                           >
                              {errors.companyCountry}
                           </Collapse>
                        </Box>

                        <Box sx={styles.selectBox}>
                           <BrandedMultiCheckBox
                              label="Company Industries"
                              options={CompanyIndustryValues}
                              value={values.companyIndustries ?? []}
                              onChange={(values) => {
                                 setFieldValue("companyIndustries", values)
                              }}
                           />
                        </Box>

                        <Box sx={styles.selectBox}>
                           <GenericDropdown
                              id="companySize-dropdown"
                              name="companySize"
                              onChange={(e) => {
                                 console.log(e.target.value)
                                 setFieldValue("companySize", e.target.value)
                              }}
                              value={values.companySize}
                              label={`Company size`}
                              list={CompanySizesCodes}
                              error={Boolean(
                                 errors.companySize && touched.companySize
                              )}
                              onBlur={handleBlur}
                              disabled={isSubmitting}
                           />
                           <Collapse
                              in={Boolean(
                                 errors.companySize && touched.companySize
                              )}
                              style={{ color: "red" }}
                           >
                              {errors.companySize}
                           </Collapse>
                        </Box>
                     </>
                     <SaveChangesButton type="submit" />
                  </Stack>
               </Form>
            )}
         </Formik>
      </Box>
   )
}

export default CompanyDetails
