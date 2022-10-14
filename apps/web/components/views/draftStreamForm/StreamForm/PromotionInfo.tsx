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
   promotionCountries: Option[]
   promotionChannels: Option[]
   promotionUniversities: Option[]
   setFieldValue: (field, value) => void
   firebase: FirebaseService
}

const PromotionInfo = ({
   promotionCountries,
   promotionChannels,
   promotionUniversities,
   setFieldValue,
   firebase,
}: Props) => {
   const [allUniversities, setAllUniversities] = useState([])

   useEffect(() => {
      ;(async () => {
         try {
            const selectedCountriesIds = promotionCountries.map(
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

            console.log("UNI -> ", allUniversities)
            setAllUniversities(allUniversities)
         } catch (e) {}
      })()
   }, [firebase, promotionCountries])

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
                  inputName="promotionChannels"
                  isCheckbox
                  selectedItems={promotionChannels}
                  allValues={channelOptionCodes}
                  getGroupByFn={mapGroupBy}
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
                  inputName="promotionCountries"
                  isCheckbox
                  selectedItems={promotionCountries}
                  allValues={countriesOptionCodes}
                  getGroupByFn={mapGroupBy}
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
                  inputName="promotionUniversities"
                  isCheckbox
                  selectedItems={promotionUniversities}
                  allValues={allUniversities}
                  getGroupByFn={mapGroupBy}
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

const mapGroupBy = (item) => item.groupId

export default withFirebase(PromotionInfo)
