import { FormControl, Grid, TextField, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import MultiListSelect from "../../common/MultiListSelect"
import { languageCodes } from "../../../helperFunctions/streamFormFunctions"
import { useLocalStorage } from "react-use"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import userRepo from "../../../../data/firebase/UserRepository"
import { useAuth } from "../../../../HOCs/AuthProvider"

const styles = sxStyles({
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

type Option = {
   code: string
   name: string
   shortName: string
}

const countriesCodes = [
   {
      code: "en",
      name: "England",
      shortName: "eng",
   },
   {
      code: "de",
      name: "Germany",
      shortName: "ger",
   },
   {
      code: "pt",
      name: "Portugal",
      shortName: "por",
   },
]

const formatToOptionArray = (
   selectedIds: string[],
   allOptions: Option[]
): Option[] => {
   return allOptions.filter(({ code }) => selectedIds.includes(code))
}

const mapOptions = (options: Option[]) => {
   return options.map((option) => option.code)
}

const AdditionalInformation = () => {
   const { authenticatedUser: user, userData } = useAuth()
   //  const [existingReferralCode] = useLocalStorage(
   //     localStorageReferralCode,
   //     "",
   //     { raw: true }
   // )

   const [selectedCountries, setSelectedCountries] = useState([] as Option[])
   const [selectedLanguages, setSelectedLanguages] = useState([] as Option[])
   // const [referralCode, setReferralCode] = useState(existingReferralCode)

   const [hasSelectedCountriesChanged, setSelectedCountriesChanged] =
      useState(false)
   const [hasSelectedLanguagesChanged, setSelectedLanguagesChanged] =
      useState(false)

   useEffect(() => {
      if (hasSelectedCountriesChanged && selectedCountries) {
         const fieldToUpdate = {
            countriesOfInterest: mapOptions(selectedCountries),
         }
         handleChange(fieldToUpdate).catch(console.error)
         setSelectedCountriesChanged(false)
      }
   }, [selectedCountries, hasSelectedCountriesChanged])

   useEffect(() => {
      if (hasSelectedLanguagesChanged && selectedLanguages) {
         const fieldToUpdate = {
            spokenLanguages: mapOptions(selectedLanguages),
         }
         handleChange(fieldToUpdate).catch(console.error)
         setSelectedLanguagesChanged(false)
      }
   }, [selectedLanguages, hasSelectedLanguagesChanged])

   useEffect(() => {
      if (userData) {
         const { countriesOfInterest, spokenLanguages } = userData

         if (countriesOfInterest?.length) {
            setSelectedCountries(
               formatToOptionArray(countriesOfInterest, countriesCodes)
            )
         }

         if (spokenLanguages?.length) {
            setSelectedLanguages(
               formatToOptionArray(spokenLanguages, languageCodes)
            )
         }
      }
   }, [userData])

   const handleChange = useCallback(async (fieldToUpdate) => {
      try {
         await userRepo.updateAdditionalInformation({
            userEmail: user.email,
            ...fieldToUpdate,
         })
      } catch (error) {
         console.log(error)
      }
   }, [])

   return (
      <Grid container spacing={2}>
         <Grid item xs={12}>
            <Typography sx={styles.subtitle} variant="h5">
               What languages do you speak?
            </Typography>
         </Grid>
         <Grid item xs={12}>
            <FormControl fullWidth>
               <MultiListSelect
                  inputName="languages"
                  isCheckbox
                  selectedItems={selectedLanguages}
                  allValues={languageCodes}
                  setFieldValue={(name, value) => setSelectedLanguages(value)}
                  onSelectItems={() => setSelectedLanguagesChanged(true)}
                  inputProps={{
                     label: "Languages you speak",
                     placeholder: "Select language",
                     className: "registrationInput",
                  }}
                  getValueFn={(item) => item}
                  getLabelFn={(item) => item.name}
                  getKeyFn={(item) => item.code}
                  chipProps={{
                     color: "primary",
                  }}
               />
            </FormControl>
         </Grid>

         <Grid item xs={12}>
            <Typography sx={styles.subtitle} variant="h5">
               In what country or area are you looking for opportunities?
            </Typography>
         </Grid>
         <Grid item xs={12}>
            <FormControl fullWidth>
               <MultiListSelect
                  inputName="countries"
                  isCheckbox
                  selectedItems={selectedCountries}
                  onSelectItems={() => setSelectedCountriesChanged(true)}
                  allValues={countriesCodes}
                  setFieldValue={(name, value) => setSelectedCountries(value)}
                  inputProps={{
                     label: "Countries of interest",
                     placeholder: "Select one or more country",
                     className: "registrationInput",
                  }}
                  getValueFn={(item) => item}
                  getLabelFn={(item) => item.name}
                  getKeyFn={(item) => item.code}
                  chipProps={{
                     color: "primary",
                  }}
               />
            </FormControl>
         </Grid>

         <Grid item xs={12}>
            <Typography sx={styles.subtitle} variant="h5">
               Referral code
            </Typography>
         </Grid>
         {/*<Grid item xs={12}>*/}
         {/*   <FormControl fullWidth>*/}
         {/*      <TextField*/}
         {/*         className="registrationInput"*/}
         {/*         variant="outlined"*/}
         {/*         fullWidth*/}
         {/*         id="referralCode"*/}
         {/*         name="referralCode"*/}
         {/*         placeholder="Enter a Referral Code"*/}
         {/*         InputLabelProps={{ shrink: true }}*/}
         {/*         onChange={({target: { value}}) =>{ setReferralCode(value)}}*/}
         {/*         value={referralCode}*/}
         {/*         label="Referral Code (Optional)"*/}
         {/*      />*/}
         {/*   </FormControl>*/}

         {/*</Grid>*/}
      </Grid>
   )
}

export default AdditionalInformation
