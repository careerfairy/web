import { Stack } from "@mui/material"
import { FC, useCallback, useMemo } from "react"

import { GroupOption } from "@careerfairy/shared-lib/groups"
import {
   University,
   UniversityCountry,
} from "@careerfairy/shared-lib/universities"
import { LoadingButton } from "@mui/lab"
import { Box } from "@mui/material"
import { useUniversityCountries } from "components/custom-hook/useCollection"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getTextFieldProps } from "components/helperFunctions/streamFormFunctions"
import {
   CompanyCountryValues,
   RelevantCompanyIndustryValues,
} from "constants/forms"
import { groupRepo } from "data/RepositoryInstances"
import { Form, Formik } from "formik"
import { useGroup } from "layouts/GroupDashboardLayout"
import BrandedAutocomplete from "../../common/inputs/BrandedAutocomplete"
import BaseStyles from "./BaseStyles"
import SectionComponent from "./SectionComponent"
import * as Yup from "yup"
import { GROUP_CONSTANTS } from "@careerfairy/shared-lib/groups/constants"

const [title, description] = [
   "Target talent",
   `Tell us which talent you’re targeting so that we can present them
   your content.`,
]

const maxCountries = GROUP_CONSTANTS.MAX_TARGET_COUNTRY_COUNT
const maxUniversities = GROUP_CONSTANTS.MAX_TARGET_UNIVERSITY_COUNT
const maxFieldOfStudy = GROUP_CONSTANTS.MAX_TARGET_FIELD_OF_STUDY_COUNT

const TargetTalent: FC = () => {
   const { group } = useGroup()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const { data: universitiesByCountry } = useUniversityCountries()

   const initialValues = useMemo<FormValues>(
      () => ({
         targetedCountries: group.targetedCountries ?? [],
         targetedUniversities: group.targetedUniversities ?? [],
         targetedFieldsOfStudy: group.targetedFieldsOfStudy ?? [],
      }),
      [
         group.targetedCountries,
         group.targetedUniversities,
         group.targetedFieldsOfStudy,
      ]
   )

   const handleSubmit = async (values: FormValues) => {
      try {
         await groupRepo.updateGroupMetadata(group.id, values)
         successNotification("saved")
      } catch (e) {
         errorNotification(e, "An error has occurred during the save")
      }
   }

   const filterUniversitiesBySelectedContries = useCallback(
      (selectedCountries: GroupOption[]) => {
         const selectedCountriesIds =
            selectedCountries?.map((country) => country.id) || []
         return getUniversityOptions(
            universitiesByCountry,
            selectedCountriesIds
         )
      },
      [universitiesByCountry]
   )

   return (
      <SectionComponent title={title} description={description}>
         <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
            validationSchema={validationSchema}
         >
            {({
               values,
               dirty,
               isSubmitting,
               setFieldValue,
               touched,
               errors,
               handleSubmit,
            }) => (
               <Form>
                  <Stack spacing={1.5}>
                     {/* Target Countries select box */}
                     <BrandedAutocomplete
                        id={"targetedCountries"}
                        sx={BaseStyles.chipInput}
                        isOptionEqualToValue={isOptionEqualToValue}
                        options={CompanyCountryValues}
                        defaultValue={values.targetedCountries}
                        getOptionLabel={getOptionLabel}
                        value={values.targetedCountries}
                        disableCloseOnSelect
                        multiple
                        limit={maxCountries}
                        onChange={(_, selected) => {
                           setFieldValue("targetedCountries", selected)
                           // setFieldValue("targetedUniversities", )
                        }}
                        textFieldProps={getTextFieldProps(
                           "Targeted countries",
                           "targetedCountries",
                           touched,
                           errors
                        )}
                     />

                     {/* Universities select box */}
                     <BrandedAutocomplete
                        id={"targetedUniversities"}
                        sx={BaseStyles.chipInput}
                        isOptionEqualToValue={isOptionEqualToValue}
                        options={filterUniversitiesBySelectedContries(
                           values.targetedCountries
                        )}
                        defaultValue={values.targetedUniversities}
                        getOptionLabel={getOptionLabel}
                        value={values.targetedUniversities}
                        disableCloseOnSelect
                        multiple
                        limit={maxUniversities}
                        onChange={(_, selected) => {
                           setFieldValue("targetedUniversities", selected)
                        }}
                        textFieldProps={getTextFieldProps(
                           "Targeted universities",
                           "targetedUniversities",
                           touched,
                           errors
                        )}
                     />

                     {/* Target fields of study select box */}
                     <BrandedAutocomplete
                        id={"targetedFieldsOfStudy"}
                        sx={BaseStyles.chipInput}
                        isOptionEqualToValue={isOptionEqualToValue}
                        options={RelevantCompanyIndustryValues}
                        defaultValue={values.targetedFieldsOfStudy}
                        getOptionLabel={getOptionLabel}
                        value={values.targetedFieldsOfStudy}
                        disableCloseOnSelect
                        multiple
                        limit={maxFieldOfStudy}
                        onChange={(_, selected) => {
                           setFieldValue("targetedFieldsOfStudy", selected)
                        }}
                        textFieldProps={getTextFieldProps(
                           "Targeted fields of study",
                           "targetedFieldsOfStudy",
                           touched,
                           errors
                        )}
                     />
                     <Box display="flex" justifyContent="flex-end">
                        <LoadingButton
                           loading={isSubmitting}
                           disabled={!dirty || isSubmitting}
                           onClick={() => handleSubmit()}
                           sx={BaseStyles.saveBtn}
                           variant="contained"
                           color="secondary"
                           size="small"
                        >
                           Save changes
                        </LoadingButton>
                     </Box>
                  </Stack>
               </Form>
            )}
         </Formik>
      </SectionComponent>
   )
}

type UniversityOption = University & {
   country: string
}

const getUniversityOptions = (
   universityCountries: UniversityCountry[],
   universityCountryCodes: string[]
): UniversityOption[] => {
   let universityCountriesArray = [...universityCountries] // if no countries are selected, show all universities
   if (universityCountryCodes.length > 0) {
      // if countries are selected, filter universities by country
      universityCountriesArray = universityCountries.filter(
         (universityCountry) =>
            universityCountryCodes.includes(universityCountry.id)
      )
   }
   const universityOptions = universityCountriesArray.reduce<
      UniversityOption[]
   >(
      (acc, universityCountry) =>
         acc.concat(
            universityCountry.universities.map((uni) => {
               return {
                  ...uni,
                  country: universityCountry.countryId,
               }
            })
         ),
      []
   )

   return universityOptions
}

const isOptionEqualToValue = (option: GroupOption, value: GroupOption) =>
   option.id === value.id

const getOptionLabel = (option) => option.name || ""

type FormValues = {
   targetedCountries: GroupOption[]
   targetedUniversities: GroupOption[]
   targetedFieldsOfStudy: GroupOption[]
}

const validationSchema: Yup.SchemaOf<FormValues> = Yup.object().shape({
   targetedCountries: Yup.array()
      .of(
         Yup.object().shape({
            id: Yup.string().required(),
            name: Yup.string().required(),
         })
      )
      .nullable()
      .max(maxCountries, `Maximum of ${maxCountries} countries`)
      .required("At least one country is required"),
   targetedUniversities: Yup.array()
      .of(
         Yup.object().shape({
            id: Yup.string().required(),
            name: Yup.string().required(),
         })
      )
      .nullable()
      .max(maxUniversities, `Maximum of ${maxUniversities} countries`)
      .required("At least one university is required"),
   targetedFieldsOfStudy: Yup.array()
      .of(
         Yup.object().shape({
            id: Yup.string().required(),
            name: Yup.string().required(),
         })
      )
      .nullable()
      .max(maxFieldOfStudy, `Maximum of ${maxFieldOfStudy} fields of study`)
      .required("At least one field of study is required"),
})

export default TargetTalent
