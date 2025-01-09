import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import {
   LanguageProficiencyLabels,
   LanguageProficiencyMap,
   LanguageProficiencyOrderMap,
   LanguageProficiencyValues,
   ProficiencyOptions,
   countriesAndRegionsOptionCodes,
   countryGroupId,
   languageOptionCodes,
   languageOptionCodesMap,
   regionGroupId,
} from "@careerfairy/shared-lib/constants/forms"
import {
   Box,
   Button,
   Grid,
   Skeleton,
   Stack,
   Switch,
   Typography,
} from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCountriesList from "components/custom-hook/countries/useCountriesList"
import useCountryCities from "components/custom-hook/countries/useCountryCities"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserLanguages } from "components/custom-hook/user/useUserLanguages"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import MultiListSelect from "components/views/common/MultiListSelect"
import SingleListSelect from "components/views/common/SingleListSelect"
import { useCallback, useEffect, useState } from "react"
import { PlusCircle, Trash2 } from "react-feather"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import {
   formatToOptionArray,
   mapOptions,
   multiListSelectMapValueFn,
} from "../utils"

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
   cancelButton: {
      color: (theme) => theme.palette.neutral[500],
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      "&:hover": {
         border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
         backgroundColor: (theme) => theme.palette.neutral[50],
      },
   },
   languageSelectWrapper: {
      borderRadius: "8px",
      backgroundColor: (theme) => theme.brand.white[100],
      boxShadow: "0px 5px 15px 0px #BDBDBD",
      p: "16px 12px",
      mb: 2,
   },
   languageName: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   languageProficiency: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[600],
   },
   languageDeleteIcon: {
      cursor: "pointer",
      color: (theme) => theme.palette.neutral[500],
      width: "20px",
      height: "20px",
      "&:hover": {
         color: (theme) => theme.palette.neutral[800],
      },
   },
   languageAddIcon: {
      color: (theme) => theme.brand.tq[600],
   },
   languageAddText: {
      color: (theme) => theme.brand.tq[600],
   },
})

const COUNTRIES_OF_INTEREST_FIELD_NAME = "countriesOfInterest"
const SPOKEN_LANGUAGES_FIELD_NAME = "spokenLanguages"
const IS_LOOKING_FOR_JOB_FIELD_NAME = "isLookingForJob"

const LocationInformation = () => {
   return (
      <SuspenseWithBoundary fallback={<LocationSkeleton />}>
         <LocationInformationView />
      </SuspenseWithBoundary>
   )
}

const LocationInformationView = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const { talentProfileV1 } = useFeatureFlags()
   const { errorNotification } = useSnackbarNotifications()

   const { data: userLanguages } = useUserLanguages()
   const { data: countriesList } = useCountriesList()

   const [isLanguageFormOpen, setIsLanguageFormOpen] = useState(false)
   const [language, setLanguage] = useState<OptionGroup | null>(null)
   const [proficiency, setProficiency] = useState<OptionGroup | null>(null)

   const [country, setCountry] = useState<OptionGroup | null>(() => {
      return userData.countryIsoCode
         ? countriesList[userData.countryIsoCode]
         : null
   })

   const { data: citiesList } = useCountryCities(country?.id)

   const [city, setCity] = useState<OptionGroup | null>(() => {
      return userData.cityIsoCode ? citiesList[userData.cityIsoCode] : null
   })

   const isLanguageFormValid = language && proficiency

   const countriesOptions = Object.keys(countriesList).map(
      (country) =>
         ({
            id: country,
            name: countriesList[country].name,
         } as OptionGroup)
   )

   const citiesOptions =
      Object.keys(citiesList)?.map(
         (city) =>
            ({
               id: city,
               name: citiesList[city].name,
            } as OptionGroup)
      ) ?? []

   const [inputValues, setInputValues] = useState({
      [COUNTRIES_OF_INTEREST_FIELD_NAME]: [] as OptionGroup[],
      [IS_LOOKING_FOR_JOB_FIELD_NAME]: false,
   })

   const selectableLanguages = languageOptionCodes.filter(
      (languageOption) =>
         !userLanguages.some(
            (language) => language.languageId === languageOption.id
         )
   )

   const hasSelectedAllLanguages =
      userLanguages.length === languageOptionCodes.length

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
      async (countryCode: string) => {
         setCountry(countriesList[countryCode] as OptionGroup)
         setCity(null)
         await userRepo.updateUserData(userData.id, {
            countryIsoCode: countryCode,
            cityIsoCode: "",
            stateIsoCode: "",
         })
      },

      [userData.id, countriesList]
   )

   const handleCountriesOfInterestChange = useCallback(
      (_: string, selectedCountriesAndRegions: OptionGroup[]) => {
         const fieldToUpdate = mapCountriesAndRegionsToFieldToUpdate(
            selectedCountriesAndRegions
         )

         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleSelectedCityChange = useCallback(
      async (cityCode: string) => {
         setCity(citiesList[cityCode] as OptionGroup)
         await userRepo.updateUserData(userData.id, {
            cityIsoCode: cityCode,
            stateIsoCode: cityCode ? citiesList[cityCode].stateIsoCode : null,
         })
      },
      [userData.id, citiesList]
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

   const handleLanguageAdd = useCallback(async () => {
      if (language && proficiency) {
         setLanguage(null)
         setProficiency(null)
         setIsLanguageFormOpen(false)

         try {
            await userRepo.createLanguage(user.email, {
               languageId: language.id,
               proficiency: LanguageProficiencyOrderMap[proficiency.id],
               authId: userData.authId,
               id: language.id,
            })
         } catch (error) {
            errorNotification(
               "An error occurred while adding the language, rest assured we're on it."
            )
            errorLogAndNotify(error, "Error adding language")
         }
      }
   }, [language, proficiency, user.email, userData.authId, errorNotification])

   const handleLanguageDelete = useCallback(
      async (languageId: string) => {
         try {
            await userRepo.deleteLanguage(user.email, languageId)
         } catch (error) {
            errorNotification(
               "An error occurred while deleting the language, rest assured we're on it."
            )
            errorLogAndNotify(error, "Error deleting language")
         }
      },
      [user.email, errorNotification]
   )

   useEffect(() => {
      if (userData) {
         const {
            countriesOfInterest = [],
            regionsOfInterest = [],
            isLookingForJob,
         } = userData

         setInputValues({
            [COUNTRIES_OF_INTEREST_FIELD_NAME]: formatToOptionArray(
               [...regionsOfInterest, ...countriesOfInterest],
               countriesAndRegionsOptionCodes
            ),
            [IS_LOOKING_FOR_JOB_FIELD_NAME]: Boolean(isLookingForJob),
         })
      }
   }, [userData])

   return (
      <>
         <Grid
            container
            spacing={2}
            justifyContent="center"
            data-testid="registration-additional-information-step"
         >
            <ConditionalWrapper condition={talentProfileV1}>
               <Grid item xs={12} sm={8}>
                  <Typography sx={styles.inputLabel} variant="h5">
                     Where are you located?
                  </Typography>
               </Grid>
               <Grid item xs={12} sm={8}>
                  <SingleListSelect
                     inputName={"countryIsoCode"}
                     selectedItem={country}
                     options={countriesOptions}
                     setFieldValue={(_, value) =>
                        handleSelectedCountriesChange(value)
                     }
                     inputProps={{
                        label: "What's your country?",
                        className: "registrationInput",
                     }}
                     extraOptions={{
                        sx: {
                           "& .MuiInputBase-input": {
                              fontWeight: 600,
                              fontSize: "16px",
                           },
                        },
                     }}
                  />
               </Grid>
               <Grid item xs={12} sm={8}>
                  <SingleListSelect
                     inputName={"cityIsoCode"}
                     selectedItem={city}
                     disabled={!country}
                     options={citiesOptions}
                     setFieldValue={(_, value) =>
                        handleSelectedCityChange(value)
                     }
                     inputProps={{
                        label: "And your city?",
                        className: "registrationInput",
                     }}
                     extraOptions={{
                        sx: {
                           "& .MuiInputBase-input": {
                              fontWeight: 600,
                              fontSize: "16px",
                           },
                        },
                     }}
                  />
               </Grid>
            </ConditionalWrapper>
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Which languages do you speak?
               </Typography>
            </Grid>
            <ConditionalWrapper condition={!talentProfileV1}>
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
            </ConditionalWrapper>
            <ConditionalWrapper
               condition={Boolean(talentProfileV1 && userLanguages?.length > 0)}
            >
               <Grid item xs={12} sm={8}>
                  {userLanguages.map((language, idx) => (
                     <Stack
                        key={language.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={[
                           styles.languageSelectWrapper,
                           {
                              mb: idx < userLanguages.length - 1 ? 2 : 0,
                           },
                        ]}
                     >
                        <Stack
                           direction="row"
                           alignItems="center"
                           spacing={0.5}
                        >
                           <Typography
                              variant="brandedBody"
                              sx={styles.languageName}
                           >
                              {languageOptionCodesMap[language.id].name}
                           </Typography>
                           <Typography
                              variant="xsmall"
                              sx={styles.languageProficiency}
                           >
                              (
                              {
                                 LanguageProficiencyLabels[
                                    LanguageProficiencyValues[
                                       language.proficiency
                                    ]
                                 ]
                              }
                              )
                           </Typography>
                        </Stack>

                        <Box
                           sx={styles.languageDeleteIcon}
                           component={Trash2}
                           onClick={() => handleLanguageDelete(language.id)}
                        />
                     </Stack>
                  ))}
               </Grid>
            </ConditionalWrapper>
            <ConditionalWrapper
               condition={Boolean(
                  talentProfileV1 &&
                     !isLanguageFormOpen &&
                     !hasSelectedAllLanguages
               )}
            >
               <Grid item xs={12} sm={8}>
                  <Stack
                     sx={[styles.languageSelectWrapper, { cursor: "pointer" }]}
                     direction="row"
                     alignItems="center"
                     justifyContent="center"
                     spacing={1}
                     onClick={() => setIsLanguageFormOpen(true)}
                  >
                     <Box
                        component={PlusCircle}
                        size={16}
                        sx={styles.languageAddIcon}
                     />
                     <Typography variant="small" sx={styles.languageAddText}>
                        Add language
                     </Typography>
                  </Stack>
               </Grid>
            </ConditionalWrapper>

            <ConditionalWrapper
               condition={Boolean(talentProfileV1 && isLanguageFormOpen)}
            >
               <Grid item xs={12} sm={8}>
                  <Stack spacing={1.5} sx={styles.languageSelectWrapper}>
                     <SingleListSelect
                        inputName={"language"}
                        selectedItem={language}
                        options={selectableLanguages}
                        setFieldValue={(_, value) => {
                           const formattedValue = formatToOptionArray(
                              [value],
                              selectableLanguages
                           )
                           setLanguage(formattedValue?.at(0) ?? null)
                        }}
                        inputProps={{
                           label: "Language",
                           placeholder: "Select language",
                           className: "registrationInput",
                        }}
                     />
                     <SingleListSelect
                        inputName={"proficiency"}
                        selectedItem={proficiency}
                        options={ProficiencyOptions}
                        setFieldValue={(_, value) =>
                           setProficiency(LanguageProficiencyMap[value])
                        }
                        inputProps={{
                           label: "Proficiency",
                           placeholder: "Select proficiency",
                           className: "registrationInput",
                        }}
                     />
                     <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                     >
                        <Button
                           variant="outlined"
                           sx={styles.cancelButton}
                           onClick={() => {
                              setLanguage(null)
                              setProficiency(null)
                              setIsLanguageFormOpen(false)
                           }}
                        >
                           Cancel
                        </Button>
                        <Button
                           variant="contained"
                           color="primary"
                           disabled={!isLanguageFormValid}
                           onClick={handleLanguageAdd}
                        >
                           Add
                        </Button>
                     </Stack>
                  </Stack>
               </Grid>
            </ConditionalWrapper>

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
                  setFieldValue={handleCountriesOfInterestChange}
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

const LocationSkeleton = () => {
   return (
      <Grid container spacing={2} justifyContent="center">
         <Grid item xs={12} sm={8}>
            <Skeleton variant="rectangular" height={50} />
         </Grid>
         <Grid item xs={12} sm={8}>
            <Skeleton variant="rectangular" height={50} />
         </Grid>
         <Grid item xs={12} sm={8}>
            <Skeleton variant="rectangular" height={50} />
         </Grid>
      </Grid>
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
