import { Grid, Typography } from "@mui/material"
import FormGroup from "../FormGroup"
import React, { useEffect, useState } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import {
   channelOptionCodes,
   countriesOptionCodes,
} from "../../../../constants/forms"
import { multiListSelectMapValueFn, Option } from "../../signup/utils"
import { withFirebase } from "../../../../context/firebase/FirebaseServiceContext"
import FirebaseService from "../../../../data/firebase/FirebaseService"
import { UniversityCountry } from "@careerfairy/shared-lib/dist/universities"

type Props = {
   promotionChannelsCodes: Option[]
   promotionCountriesCodes: Option[]
   promotionUniversitiesCodes: Option[]
   setFieldValue: (field, value) => void
   firebase: FirebaseService
}

const PromotionInfo = ({
   promotionChannelsCodes,
   promotionCountriesCodes,
   promotionUniversitiesCodes,
   setFieldValue,
   firebase,
}: Props) => {
   const [allUniversities, setAllUniversities] = useState([])

   useEffect(() => {
      ;(async () => {
         try {
            const selectedCountriesIds = promotionCountriesCodes.map(
               (option) => option.id
            )
            const universitiesSnapShot =
               await firebase.getUniversitiesFromMultipleCountryCode(
                  selectedCountriesIds
               )

            const allUniversities = universitiesSnapShot.docs.reduce(
               (acc, doc) => {
                  const universitiesCountries = doc.data() as UniversityCountry
                  return [...acc, ...universitiesCountries.universities]
               },
               []
            )

            setAllUniversities(allUniversities)
         } catch (e) {}
      })()
   }, [firebase, promotionCountriesCodes])

   return (
      <>
         <Typography fontWeight="bold" variant="h4">
            Promotion
         </Typography>
         <Typography variant="subtitle1" mt={1} color="textSecondary">
            Choose promotion options to advertise this event
         </Typography>

         <FormGroup container boxShadow={0}>
            <Grid item xs={12}>
               <MultiListSelect
                  inputName="promotionChannelsCodes"
                  isCheckbox
                  selectedItems={promotionChannelsCodes}
                  allValues={channelOptionCodes}
                  setFieldValue={setFieldValue}
                  inputProps={{
                     label: "Promotion Channels",
                     placeholder:
                        "Select Promotion Channel (Facebook/Instagram/Tik Tok)",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "secondary",
                  }}
               />
            </Grid>

            <Grid item xs={12}>
               <MultiListSelect
                  inputName="promotionCountriesCodes"
                  isCheckbox
                  selectedItems={promotionCountriesCodes}
                  allValues={countriesOptionCodes}
                  setFieldValue={setFieldValue}
                  inputProps={{
                     label: "Countries for Promotion",
                     placeholder:
                        "Select Countries in which promotion is desired",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "secondary",
                  }}
               />
            </Grid>

            <Grid item xs={12}>
               <MultiListSelect
                  inputName="promotionUniversitiesCodes"
                  isCheckbox
                  selectedItems={promotionUniversitiesCodes}
                  allValues={allUniversities}
                  setFieldValue={setFieldValue}
                  inputProps={{
                     label: "Universities for Promotion",
                     placeholder:
                        "Select Universities in which promotion is desired",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "secondary",
                  }}
               />
            </Grid>
         </FormGroup>
      </>
   )
}

export default withFirebase(PromotionInfo)
