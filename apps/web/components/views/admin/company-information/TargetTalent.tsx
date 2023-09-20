import React, { FC, useEffect, useMemo, useState } from "react"
import { Autocomplete, Chip, Stack, TextField } from "@mui/material"
import { Box } from "@mui/system"
import { v4 as uuid } from "uuid"

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
import {
   University,
   UniversityCountry,
   universityCountryMap,
} from "@careerfairy/shared-lib/universities"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { Group, GroupOption } from "@careerfairy/shared-lib/groups"
import { sxStyles } from "types/commonTypes"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import SectionComponent from "./SectionComponent"
import BrandedChip from "./BrandedChip"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { Country } from "schema-dts"
import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { useUniversityCountries } from "components/custom-hook/useCollection"

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

const [title, description] = [
   "Target talent",
   `Tell us which talent you’re targeting so that we can present them
   your content.`,
]

// Using a map to reduce the O complexity
const mapUniversitiesByCountryId = (
   universitiesByCountryList: UniversityCountry[]
) => {
   const map = []
   universitiesByCountryList.forEach((item) => {
      map[item.id] = item
   })
   return map
}

const TargetTalent: FC = () => {
   const { group: company } = useGroup()
   const [selectedCountries, setSelectedCountries] = useState<GroupOption[]>([])
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { data: universitiesByCountry } = useUniversityCountries()
   const countriesMap = useMemo(() => {
      return mapUniversitiesByCountryId(universitiesByCountry)
   }, [universitiesByCountry])

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

   const filterUniversitiesBySelectedContries = useMemo<University[]>(() => {
      const selectedCountriesIds = selectedCountries?.map(
         (country) => country.id
      )
      let selectedUniversities = []
      selectedCountriesIds.forEach((countryId) => {
         const filtered = countriesMap[countryId] ?? {}
         selectedUniversities = [
            ...filtered?.universities,
            ...selectedUniversities,
         ]
      })
      return selectedUniversities
   }, [selectedCountries, countriesMap])

   return (
      <SectionComponent title={title} description={description}>
         <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, dirty, handleBlur, isSubmitting, setFieldValue }) => (
               <Form>
                  <Stack
                     direction={"column"}
                     sx={{
                        gap: "12px",
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: "100%",
                     }}
                  >
                     {/* Target Countries select box */}
                     <Autocomplete
                        id={"targetedCountries"}
                        options={CompanyCountryValues}
                        defaultValue={values.targetedCountries}
                        getOptionLabel={(option) => option.name || ""}
                        value={values.targetedCountries ?? []}
                        multiple
                        onChange={(_, selected) => {
                           setSelectedCountries(selected)
                           setFieldValue("targetedCountries", selected)
                        }}
                        renderTags={(values, getTagProps) => {
                           return values.map((value, index) => (
                              <BrandedChip
                                 key={value.id}
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

                     {/* Universities select box */}
                     <Autocomplete
                        id={"targetedUniversities"}
                        options={filterUniversitiesBySelectedContries}
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
                                 key={value.id}
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

                     {/* Target fields of study select box */}
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
                                 key={value.id}
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
