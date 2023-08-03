import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
   Button,
   Container,
   Grid,
   Stack,
   TextField,
   Typography,
} from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import FilePickerContainer from "components/ssr/FilePickerContainer"
import { BaseGroupInfo } from "pages/group/create"
import { Form, Formik } from "formik"
import * as yup from "yup"
import SaveChangesButton from "./SaveChangesButton"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import BrandedMultiCheckBox from "components/views/common/inputs/BrandedMultiCheckBox"
import {
   CompanyCountryValues,
   CompanyIndustryValues,
   RelevantCompanyIndustryValues,
} from "constants/forms"
import { useGroup } from "layouts/GroupDashboardLayout"
import { groupRepo, universityRepo } from "data/RepositoryInstances"
import { GroupedUniversity } from "components/views/group/create/CreateBaseGroup"
import VirtualizedAutocomplete from "components/views/common/VirtualizedAutocomplete"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { Group } from "@careerfairy/shared-lib/groups"

const schema = yup.object().shape({
   logoUrl: yup.string().trim().required("URL is required").url("Invalid URL"),
   logoFileObj: yup.mixed().required("Image file is required"),
})

const TargetTalent = () => {
   const { group: company } = useGroup()
   const [groupedUniversities, setGroupedUniversities] = useState<
      GroupedUniversity[]
   >([])

   const initialValues = useMemo(
      () => ({
         targetedCountries: company.targetedCountries ?? [],
         targetedUniversities: company.targetedUniversities ?? [],
         targetedFieldsOfStudy: company.targetedFieldsOfStudy ?? [],
      }),
      [
         company.targetedCountries,
         company.targetedUniversities,
         company.targetedFieldsOfStudy,
      ]
   )

   useEffect(() => {
      ;(async function () {
         const allUniversitiesByCountries =
            await universityRepo.getAllUniversitiesByCountries()
         setGroupedUniversities(
            allUniversitiesByCountries
               .reduce<GroupedUniversity[]>((acc, universitiesByCountry) => {
                  const countryCode = universitiesByCountry.id
                  const countryName =
                     universityCountryMap[countryCode] || "other"
                  const universities = universitiesByCountry.universities
                  return [
                     ...acc,
                     ...universities.map((university) => ({
                        ...university,
                        countryName,
                     })),
                  ]
               }, [])
               .sort(dynamicSort("countryName"))
         )
      })()
   }, [])

   const handleSubmit = (values) => {
      debugger
      try {
         const targets: Pick<
            Group,
            | "targetedCountries"
            | "targetedUniversities"
            | "targetedFieldsOfStudy"
         > = {
            targetedCountries: values.targetedCountries,
            targetedUniversities: values.targetedUniversities,
            targetedFieldsOfStudy: values.targetedFieldsOfStudy,
         }
         groupRepo.updateGroupMetadata(company.id, { ...targets })
         console.log("saved")
      } catch (error) {
         console.log(error)
      }
   }
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
         <Formik initialValues={initialValues} onSubmit={handleSubmit}>
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
                  <Stack
                     direction={"column"}
                     sx={{ gap: "12px" }}
                     width={"-webkit-fill-available"}
                  >
                     <BrandedMultiCheckBox
                        label="Targeted countries"
                        options={CompanyCountryValues}
                        value={values.targetedCountries ?? []}
                        onChange={(values) => {
                           setFieldValue("targetedCountries", values)
                        }}
                     />
                     <VirtualizedAutocomplete
                        options={groupedUniversities}
                        onBlur={handleBlur}
                        multiple
                        openOnFocus
                        disableCloseOnSelect
                        freeSolo={false}
                        value={values.targetedUniversities || []}
                        disabled={isSubmitting}
                        onChange={(event, value) =>
                           setFieldValue("targetedUniversities", value)
                        }
                        groupBy={(option) => option.countryName}
                        isOptionEqualToValue={(option, value) =>
                           option.id === value.id
                        }
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option) => [props, option.name]}
                        fullWidth
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              name={"targetedUniversities"}
                              label={"Choose a University"}
                              error={Boolean(
                                 touched.targetedUniversities &&
                                    errors.targetedUniversities
                              )}
                              helperText={
                                 touched.targetedUniversities
                                    ? errors.targetedUniversities
                                    : null
                              }
                           />
                        )}
                     />
                     <BrandedMultiCheckBox
                        label="Targeted fields of study"
                        options={RelevantCompanyIndustryValues}
                        value={values.targetedFieldsOfStudy ?? []}
                        onChange={(values) => {
                           setFieldValue("targetedFieldsOfStudy", values)
                        }}
                     />
                     <SaveChangesButton type="submit" />
                  </Stack>
               </Form>
            )}
         </Formik>
      </Box>
   )
}

export default TargetTalent
