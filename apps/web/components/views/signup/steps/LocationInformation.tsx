import { Grid, Switch, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import MultiListSelect from "../../common/MultiListSelect"
import { useAuth } from "../../../../HOCs/AuthProvider"
import {
   countriesAndRegionsOptionCodes,
   countryGroupId,
   languageOptionCodes,
   regionGroupId,
} from "@careerfairy/shared-lib/constants/forms"
import {
   formatToOptionArray,
   mapOptions,
   multiListSelectMapValueFn,
} from "../utils"
import { userRepo } from "../../../../data/RepositoryInstances"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   toggleInputWrapper: {
      my: 1,
      display: "flex",
      alignItems: "center",
   },
})

const COUNTRIES_OF_INTEREST_FIELD_NAME = "countriesOfInterest"
const SPOKEN_LANGUAGES_FIELD_NAME = "spokenLanguages"
const IS_LOOKING_FOR_JOB_FIELD_NAME = "isLookingForJob"

const LocationInformation = () => {
   const { authenticatedUser: user, userData } = useAuth()

   const [inputValues, setInputValues] = useState({
      [COUNTRIES_OF_INTEREST_FIELD_NAME]: [] as OptionGroup[],
      [SPOKEN_LANGUAGES_FIELD_NAME]: [] as OptionGroup[],
      [IS_LOOKING_FOR_JOB_FIELD_NAME]: false,
   })

   useEffect(() => {
      if (userData) {
         const {
            countriesOfInterest = [],
            regionsOfInterest = [],
            spokenLanguages,
            isLookingForJob,
         } = userData

         setInputValues({
            [COUNTRIES_OF_INTEREST_FIELD_NAME]: formatToOptionArray(
               [...regionsOfInterest, ...countriesOfInterest],
               countriesAndRegionsOptionCodes
            ),
            [SPOKEN_LANGUAGES_FIELD_NAME]: formatToOptionArray(
               spokenLanguages,
               languageOptionCodes
            ),
            [IS_LOOKING_FOR_JOB_FIELD_NAME]: Boolean(isLookingForJob),
         })
      }
   }, [userData])

   const updateFields = useCallback(
      async (fieldToUpdate) => {
         try {
            await userRepo.updateAdditionalInformation(
               user.email,
               fieldToUpdate
            )
         } catch (error) {
            console.log(error)
         }
      },
      [user]
   )

   const handleSelectedLanguageChange = useCallback(
      (name: string, selectedLanguages: OptionGroup[]) => {
         const fieldToUpdate = {
            spokenLanguages: mapOptions(selectedLanguages),
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleSelectedCountriesChange = useCallback(
      (name: string, selectedCountriesAndRegions: OptionGroup[]) => {
         const fieldToUpdate = mapCountriesAndRegionsToFieldToUpdate(
            selectedCountriesAndRegions
         )

         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleIsLookingForJobChange = useCallback(
      (event, isLookingForJob: boolean) => {
         const fieldToUpdate = {
            isLookingForJob: isLookingForJob,
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   return (
      <>
         <Grid
            container
            spacing={2}
            justifyContent="center"
            data-testid="registration-additional-information-step"
         >
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Which languages do you speak?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <MultiListSelect
                  inputName={SPOKEN_LANGUAGES_FIELD_NAME}
                  isCheckbox
                  selectedItems={inputValues[SPOKEN_LANGUAGES_FIELD_NAME]}
                  allValues={languageOptionCodes}
                  setFieldValue={handleSelectedLanguageChange}
                  inputProps={{
                     label: "Languages you speak",
                     placeholder: "Select languages",
                     className: "registrationInput",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "primary",
                  }}
               />
            </Grid>

            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  In what country or region are you looking for opportunities?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <MultiListSelect
                  inputName={COUNTRIES_OF_INTEREST_FIELD_NAME}
                  isCheckbox
                  selectedItems={inputValues[COUNTRIES_OF_INTEREST_FIELD_NAME]}
                  allValues={countriesAndRegionsOptionCodes}
                  getGroupByFn={mapGroupBy}
                  setFieldValue={handleSelectedCountriesChange}
                  inputProps={{
                     label: "Countries of interest",
                     placeholder: "Select one or more countries or regions.",
                     className: "registrationInput",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "primary",
                  }}
               />
            </Grid>

            <Grid item xs={12} sm={8} sx={styles.toggleInputWrapper}>
               <Typography sx={styles.inputLabel} mr={2} variant="h5">
                  Are you currently looking for a job?
               </Typography>
               <Switch
                  id={IS_LOOKING_FOR_JOB_FIELD_NAME}
                  checked={inputValues[IS_LOOKING_FOR_JOB_FIELD_NAME]}
                  onChange={handleIsLookingForJobChange}
                  name="isLookingForJobToggle"
                  color="primary"
               />
            </Grid>
         </Grid>
      </>
   )
}

const mapCountriesAndRegionsToFieldToUpdate = (selectedCountriesAndRegions) => {
   const selectedCountries = selectedCountriesAndRegions.filter(
      (item) => item.groupId === countryGroupId
   )
   const selectedRegions = selectedCountriesAndRegions.filter(
      (item) => item.groupId === regionGroupId
   )

   const mappedCountries = mapOptions(selectedCountries)
   const mappedRegions = mapOptions(selectedRegions)

   const toUpdate = {
      countriesOfInterest: mappedCountries,
      regionsOfInterest: mappedRegions,
   }

   return toUpdate
}

const mapGroupBy = (item) => item.groupId

export default LocationInformation
