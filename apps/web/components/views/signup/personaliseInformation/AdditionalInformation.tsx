import { FormControl, Grid, Switch, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import MultiListSelect from "../../common/MultiListSelect"
import { languageCodes } from "../../../helperFunctions/streamFormFunctions"
import userRepo from "../../../../data/firebase/UserRepository"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { useInterests } from "../../../custom-hook/useCollection"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   headerWrapper: {
      marginTop: 6,
      marginBottom: 6,
      textAlign: "center",
   },
   title: {
      fontWeight: 400,
      fontSize: "2.5rem",
      lineHeight: "63px",
      letterSpacing: "-0.02em",
   },
   subtitle: {
      fontSize: "1.1rem",
      fontWeight: 400,
      lineHeight: "29px",
      letterSpacing: "-0.02em",
   },
   toggleInputWrapper: {
      my: 1,
      display: "flex",
      alignItems: "center",
   },
})

type Option = {
   id: string
   name: string
}

const countriesCodes = [
   {
      id: "en",
      name: "England",
   },
   {
      id: "de",
      name: "Germany",
   },
   {
      id: "pt",
      name: "Portugal",
   },
]

const formatToOptionArray = (
   selectedIds: string[],
   allOptions: Option[]
): Option[] => {
   return allOptions.filter(({ id }) => selectedIds?.includes(id))
}

const mapLanguageCodeToOptionArray = (): Option[] => {
   return languageCodes.map(({ code, name }) => ({ id: code, name }))
}

const mappedLanguageCodes = mapLanguageCodeToOptionArray()

const mapOptions = (options: Option[]) => {
   return options.map((option) => option.id)
}

const AdditionalInformation = () => {
   const { data: allInterests } = useInterests()
   const { authenticatedUser: user, userData } = useAuth()

   const [selectedCountries, setSelectedCountries] = useState([] as Option[])
   const [selectedLanguages, setSelectedLanguages] = useState([] as Option[])
   const [selectedInterests, setSelectedInterests] = useState([] as Option[])
   const [isLookingForJobToggle, setIsLookingForJobToggle] = useState(false)

   const updateFields = useCallback(
      async (fieldToUpdate) => {
         try {
            await userRepo.updateAdditionalInformation({
               userEmail: user.email,
               ...fieldToUpdate,
            })
         } catch (error) {
            console.log(error)
         }
      },
      [user]
   )

   const handleSelectedLanguageChange = useCallback(
      (selectedLanguages: Option[]) => {
         const fieldToUpdate = {
            spokenLanguages: mapOptions(selectedLanguages),
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleSelectedCountriesChange = useCallback(
      (selectedCountries: Option[]) => {
         const fieldToUpdate = {
            countriesOfInterest: mapOptions(selectedCountries),
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleSelectedInterestsChange = useCallback(
      (selectedInterests: Option[]) => {
         const fieldToUpdate = {
            interestsIds: mapOptions(selectedInterests),
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleIsLookingForJobChange = useCallback(
      (isLookingForJob: boolean) => {
         const fieldToUpdate = {
            isLookingForJob: isLookingForJob,
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   useEffect(() => {
      if (userData) {
         const {
            countriesOfInterest,
            spokenLanguages,
            interestsIds,
            isLookingForJob,
         } = userData

         setSelectedCountries(
            formatToOptionArray(countriesOfInterest, countriesCodes)
         )
         setSelectedLanguages(
            formatToOptionArray(spokenLanguages, mappedLanguageCodes)
         )
         setSelectedInterests(formatToOptionArray(interestsIds, allInterests))
         setIsLookingForJobToggle(Boolean(isLookingForJob))
      }
   }, [userData, allInterests])

   return (
      <>
         <Grid sx={styles.headerWrapper}>
            <Typography sx={styles.title}>
               A few more things before we kick off...
            </Typography>
            <Typography sx={styles.subtitle}>
               To help us pick the best events for you, tell us more about your
               interests
            </Typography>
         </Grid>

         <Grid container maxWidth="sm" mx={"auto"} spacing={2}>
            <Grid item xs={12}>
               <Typography sx={styles.inputLabel} variant="h5">
                  What languages do you speak?
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <FormControl fullWidth>
                  <MultiListSelect
                     inputName="languages"
                     isCheckbox
                     selectedItems={selectedLanguages}
                     allValues={mappedLanguageCodes}
                     setFieldValue={(name, value) =>
                        handleSelectedLanguageChange(value)
                     }
                     inputProps={{
                        label: "Languages you speak",
                        placeholder: "Select language",
                        className: "registrationInput",
                     }}
                     getValueFn={(item) => item}
                     chipProps={{
                        color: "primary",
                     }}
                  />
               </FormControl>
            </Grid>

            <Grid item xs={12}>
               <Typography sx={styles.inputLabel} variant="h5">
                  In what country or area are you looking for opportunities?
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <FormControl fullWidth>
                  <MultiListSelect
                     inputName="countries"
                     isCheckbox
                     selectedItems={selectedCountries}
                     allValues={countriesCodes}
                     setFieldValue={(name, value) =>
                        handleSelectedCountriesChange(value)
                     }
                     inputProps={{
                        label: "Countries of interest",
                        placeholder: "Select one or more country",
                        className: "registrationInput",
                     }}
                     getValueFn={(item) => item}
                     chipProps={{
                        color: "primary",
                     }}
                  />
               </FormControl>
            </Grid>

            <Grid item xs={12} sx={styles.toggleInputWrapper}>
               <Typography sx={styles.inputLabel} mr={2} variant="h5">
                  Are you currently looking for a job?
               </Typography>
               <Switch
                  checked={isLookingForJobToggle}
                  onChange={(event, checked) =>
                     handleIsLookingForJobChange(checked)
                  }
                  name="isLookingForJobToggle"
                  color="primary"
               />
            </Grid>

            <Grid item xs={12}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Lastly, select your interests
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <FormControl fullWidth>
                  <MultiListSelect
                     inputName="interests"
                     isCheckbox
                     limit={5}
                     selectedItems={selectedInterests}
                     allValues={allInterests}
                     setFieldValue={(name, value) =>
                        handleSelectedInterestsChange(value)
                     }
                     inputProps={{
                        label: "Select 5 to improve your site experience",
                        placeholder: "Select from the following list",
                        className: "registrationInput",
                     }}
                     getValueFn={(item) => item}
                     chipProps={{
                        color: "primary",
                     }}
                  />
               </FormControl>
            </Grid>
         </Grid>
      </>
   )
}

export default AdditionalInformation
