import React, { useCallback, useMemo } from "react"
import { Autocomplete, Chip, Stack } from "@mui/material"
import { Box } from "@mui/system"

import { Form, Formik } from "formik"
import { sxStyles } from "types/commonTypes"
import SaveChangesButton from "./SaveChangesButton"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   CompanySizesCodes,
} from "constants/forms"
import GenericDropdown from "components/views/common/GenericDropdown"
import BrandedMultiCheckBox from "components/views/common/inputs/BrandedMultiCheckBox"
import { useGroup } from "layouts/GroupDashboardLayout"
import { groupRepo } from "data/RepositoryInstances"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import SectionComponent from "./SectionComponent"
import BrandedAutocomplete from "components/views/common/inputs/BrandedAutocomplete"
import BrandedChip from "./BrandedChip"

const styles = sxStyles({
   selectBox: {
      width: "100%",
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
         width: "100%",
      },
      "#branded-multi-checkbox": {
         width: "100%",
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
         companyIndustries: company.companyIndustries ?? [],
         companySize: company.companySize,
         description: company.description,
         careerPageUrl: company.careerPageUrl,
         extraInfo: company.extraInfo,
      }),
      [
         company.universityName,
         company.companyCountry,
         company.companyIndustries,
         company.companySize,
         company.description,
         company.careerPageUrl,
         company.extraInfo,
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

   const [title, description] = [
      "Details",
      `Share information about your company to the next generation of
      talent. This information will be visible on your company profile,
      as well as your live streams, and can be edited at any time.`,
   ]
   return (
      <SectionComponent title={title} description={description}>
         <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={handleSubmit}
         >
            {({ values, dirty, handleBlur, isSubmitting, setFieldValue }) => (
               <Form>
                  <Stack
                     direction={"column"}
                     sx={{ gap: "12px", width: "100%" }}
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
                        name="careerPageUrl"
                        label="Career page URL"
                        placeholder="Ex: company.io/careers"
                        value={values.careerPageUrl}
                        onChange={(e) =>
                           setFieldValue("careerPageUrl", e.target.value)
                        }
                     />
                     <BrandedTextField
                        name="extraInfo"
                        multiline={true}
                        rows={4}
                        label="Describe your company"
                        placeholder="E.g., Briefly describe your company's mission, products/services, and target audience"
                        value={values.extraInfo}
                        onChange={(e) =>
                           setFieldValue("extraInfo", e.target.value)
                        }
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
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                 />
                              )}
                           />
                        </Box>

                        <Box sx={styles.selectBox}>
                           <Autocomplete
                              id={"companyIndustries"}
                              options={CompanyIndustryValues}
                              defaultValue={values.companyIndustries}
                              getOptionLabel={(option) => option.name || ""}
                              value={values.companyIndustries ?? []}
                              multiple
                              onChange={(_, selected) => {
                                 setFieldValue("companyIndustries", selected)
                              }}
                              renderTags={(values, getTagProps) => {
                                 return values.map((value, index) => (
                                    <BrandedChip
                                       key={index}
                                       label={value.name}
                                       meta={getTagProps({ index })}
                                    />
                                 ))
                              }}
                              renderInput={(params) => (
                                 <BrandedTextField
                                    {...params}
                                    label={`Company Industries`}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                 />
                              )}
                           />
                        </Box>

                        <Box sx={styles.selectBox}>
                           <Autocomplete
                              id={"companySize"}
                              options={CompanySizesCodes}
                              defaultValue={values.companyIndustries}
                              getOptionLabel={(option) => option.label || ""}
                              value={values.companySize}
                              onChange={(_, selected) => {
                                 setFieldValue("companySize", selected)
                              }}
                              renderInput={(params) => (
                                 <BrandedTextField
                                    {...params}
                                    label={`Company size`}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                 />
                              )}
                           />
                        </Box>
                     </>
                     <SaveChangesButton active={dirty} type="submit" />
                  </Stack>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

export default CompanyDetails
