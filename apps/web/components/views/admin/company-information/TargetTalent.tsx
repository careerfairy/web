import React, { useEffect, useMemo, useState } from "react"
import { Autocomplete, Chip, Stack, TextField } from "@mui/material"
import { Box } from "@mui/system"

import Styles from "./BaseStyles"
import { Form, Formik } from "formik"
import SaveChangesButton from "./SaveChangesButton"
import BrandedMultiCheckBox from "components/views/common/inputs/BrandedMultiCheckBox"
import {
   CompanyCountryValues,
   RelevantCompanyIndustryValues,
} from "constants/forms"
import { useGroup } from "layouts/GroupDashboardLayout"
import { groupRepo, universityRepo } from "data/RepositoryInstances"
import { GroupedUniversity } from "components/views/group/create/CreateBaseGroup"
import VirtualizedAutocomplete from "components/views/common/VirtualizedAutocomplete"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { Group } from "@careerfairy/shared-lib/groups"
import { sxStyles } from "types/commonTypes"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import SectionComponent from "./SectionComponent"
import BrandedChip from "./BrandedChip"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"

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
   saveBtn: {
      display: "flex",
      width: "100%",
      justifyContent: "end",
   },
})

const TargetTalent = () => {
   const { group: company } = useGroup()
   const [groupedUniversities, setGroupedUniversities] = useState<
      GroupedUniversity[]
   >([])
   const { successNotification, errorNotification } = useSnackbarNotifications()

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
         successNotification("saved")
      } catch (e) {
         errorNotification(e, "An error has occurred during the save")
      }
   }

   const [title, description] = [
      "Target talent",
      `Tell us which talent you’re targeting so that we can present them
      your content.`,
   ]
   return (
      <SectionComponent title={title} description={description}>
         <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, dirty, handleBlur, isSubmitting, setFieldValue }) => (
               <Form>
                  <Stack
                     direction={"column"}
                     sx={{
                        display: "flex",
                        width: "100%",
                        gap: "12px",
                     }}
                  >
                     {/* Target Contries select box */}
                     <Box sx={styles.selectBox}>
                        <Autocomplete
                           id={"targetedCountries"}
                           options={CompanyCountryValues}
                           defaultValue={values.targetedCountries}
                           getOptionLabel={(option) => option.name || ""}
                           value={values.targetedCountries ?? []}
                           multiple
                           onChange={(_, selected) => {
                              setFieldValue("targetedCountries", selected)
                           }}
                           renderTags={(values, getTagProps) => {
                              return values.map((value, index) => (
                                 <BrandedChip
                                    label={value.name}
                                    meta={getTagProps({ index })}
                                 />
                              ))
                           }}
                           renderInput={(params) => (
                              <BrandedTextField
                                 {...params}
                                 label={`Targeted countries`}
                                 onBlur={handleBlur}
                                 disabled={isSubmitting}
                              />
                           )}
                        />
                     </Box>

                     {/* Universities select box */}
                     <Box sx={styles.selectBox}>
                        <Autocomplete
                           id={"targetedUniversities"}
                           options={groupedUniversities}
                           defaultValue={values.targetedUniversities}
                           getOptionLabel={(option) => option.name || ""}
                           value={values.targetedUniversities || []}
                           multiple
                           onChange={(_, selected) => {
                              setFieldValue("targetedUniversities", selected)
                           }}
                           groupBy={(option) => option.countryName}
                           renderTags={(values, getTagProps) => {
                              return values.map((value, index) => (
                                 <BrandedChip
                                    label={value.name}
                                    meta={getTagProps({ index })}
                                 />
                              ))
                           }}
                           renderInput={(params) => (
                              <BrandedTextField
                                 {...params}
                                 label={`Targeted universities`}
                                 onBlur={handleBlur}
                                 disabled={isSubmitting}
                              />
                           )}
                        />
                     </Box>

                     {/* Target fields of study select box */}
                     <Box sx={styles.selectBox}>
                        <Autocomplete
                           id={"targetedFieldsOfStudy"}
                           options={RelevantCompanyIndustryValues}
                           defaultValue={values.targetedFieldsOfStudy}
                           getOptionLabel={(option) => option.name || ""}
                           value={values.targetedFieldsOfStudy ?? []}
                           multiple
                           onChange={(_, selected) => {
                              setFieldValue("targetedFieldsOfStudy", selected)
                           }}
                           renderTags={(values, getTagProps) => {
                              return values.map((value, index) => (
                                 <BrandedChip
                                    label={value.name}
                                    meta={getTagProps({ index })}
                                 />
                              ))
                           }}
                           renderInput={(params) => (
                              <BrandedTextField
                                 {...params}
                                 label={`Targeted fields of study`}
                                 onBlur={handleBlur}
                                 disabled={isSubmitting}
                              />
                           )}
                        />
                     </Box>

                     <Box sx={styles.saveBtn}>
                        <SaveChangesButton active={dirty} type="submit" />
                     </Box>
                  </Stack>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

export default TargetTalent
