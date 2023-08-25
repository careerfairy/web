import React, { useEffect, useMemo, useState } from "react"
import { Stack, TextField } from "@mui/material"
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
            {({
               values,
               errors,
               touched,
               handleBlur,
               isSubmitting,
               setFieldValue,
            }) => (
               <Form>
                  <Stack
                     direction={"column"}
                     sx={{
                        display: "grid",
                        width: "100%",
                        gap: "12px",
                     }}
                  >
                     <BrandedMultiCheckBox
                        label="Targeted countries"
                        options={CompanyCountryValues}
                        value={values.targetedCountries ?? []}
                        onChange={(values) => {
                           setFieldValue("targetedCountries", values)
                        }}
                        sx={styles.selectBox}
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
                        sx={styles.selectBox}
                     />
                     <BrandedMultiCheckBox
                        label="Targeted fields of study"
                        options={RelevantCompanyIndustryValues}
                        value={values.targetedFieldsOfStudy ?? []}
                        onChange={(values) => {
                           setFieldValue("targetedFieldsOfStudy", values)
                        }}
                        sx={styles.selectBox}
                     />
                     <Box sx={{ justifySelf: "flex-end" }}>
                        <SaveChangesButton type="submit" />
                     </Box>
                  </Stack>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

export default TargetTalent
