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
   FormHelperText,
   Grid,
   Stack,
   Switch,
   Typography,
} from "@mui/material"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { useUserLanguages } from "components/custom-hook/user/useUserLanguages"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import MultiListSelect from "components/views/common/MultiListSelect"
import SingleListSelect from "components/views/common/SingleListSelect"
import { useCallback, useEffect, useState } from "react"
import { PlusCircle, Trash2 } from "react-feather"
import { useDispatch } from "react-redux"
import { disableContinue } from "store/reducers/userSignUpReducer"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import { UserCitySelector } from "../personaliseInformation/UserCitySelector"
import { UserCountrySelector } from "../personaliseInformation/UserCountrySelector"
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
   const { authenticatedUser: user, userData } = useAuth()
   const { talentProfileV1 } = useFeatureFlags()
   const { errorNotification } = useSnackbarNotifications()
   const dispatch = useDispatch()
   const { data: userLanguages } = useUserLanguages()

   const [isLanguageFormOpen, setIsLanguageFormOpen] = useState(false)
   const [language, setLanguage] = useState<OptionGroup | null>(null)
   const [proficiency, setProficiency] = useState<OptionGroup | null>(null)

   const isLanguageFormValid = language && proficiency

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
         updateFields(fieldToUpdate).catch(errorLogAndNotify)
      },
      [updateFields]
   )

   const handleCountriesOfInterestChange = useCallback(
      (_: string, selectedCountriesAndRegions: OptionGroup[]) => {
         const fieldToUpdate = mapCountriesAndRegionsToFieldToUpdate(
            selectedCountriesAndRegions
         )

         updateFields(fieldToUpdate).catch(errorLogAndNotify)
      },
      [updateFields]
   )

   const handleIsLookingForJobChange = useCallback(
      (event, isLookingForJob: boolean) => {
         const fieldToUpdate = {
            isLookingForJob: isLookingForJob,
         }
         updateFields(fieldToUpdate).catch(errorLogAndNotify)
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

   useEffect(() => {
      if (!talentProfileV1) return
      const isDisabled =
         !userData.countryIsoCode ||
         !userData.cityIsoCode ||
         !userData.stateIsoCode ||
         !userLanguages?.length
      dispatch(
         disableContinue({
            step: 3,
            disable: isDisabled,
         })
      )
   }, [
      userData.countryIsoCode,
      userData.cityIsoCode,
      userData.stateIsoCode,
      userLanguages?.length,
      dispatch,
      talentProfileV1,
   ])

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
                  <UserCountrySelector />
               </Grid>
               <Grid item xs={12} sm={8}>
                  <UserCitySelector />
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
            <ConditionalWrapper
               condition={Boolean(
                  talentProfileV1 &&
                     !userLanguages?.length &&
                     !isLanguageFormOpen
               )}
            >
               <Grid item xs={12} sm={8}>
                  {!userLanguages?.length && !isLanguageFormOpen ? (
                     <FormHelperText
                        sx={{ color: "error.main", ml: 2, mt: -3.5 }}
                     >
                        Please select at least one language.
                     </FormHelperText>
                  ) : null}
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
