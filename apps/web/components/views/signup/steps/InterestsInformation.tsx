import { sxStyles } from "../../../../types/commonTypes"
import { Grid, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import { useInterests } from "../../../custom-hook/useCollection"
import { useAuth } from "../../../../HOCs/AuthProvider"
import {
   formatToOptionArray,
   mapOptions,
   multiListSelectMapValueFn,
   Option,
} from "../utils"
import { userRepo } from "../../../../data/RepositoryInstances"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

const SELECTED_INTERESTS_FIELD_NAME = "interestsIds"

const InterestsInformation = () => {
   const { data: allInterests } = useInterests()
   const { authenticatedUser: user, userData } = useAuth()

   const [inputValues, setInputValues] = useState({
      [SELECTED_INTERESTS_FIELD_NAME]: [] as Option[],
   })

   useEffect(() => {
      if (userData) {
         const { interestsIds } = userData

         setInputValues({
            [SELECTED_INTERESTS_FIELD_NAME]: formatToOptionArray(
               interestsIds,
               allInterests
            ),
         })
      }
   }, [userData, allInterests])

   const handleSelectedInterestsChange = useCallback(
      async (name: string, selectedInterests: Option[]) => {
         try {
            await userRepo.updateAdditionalInformation(user.email, {
               [name]: mapOptions(selectedInterests),
            })
         } catch (error) {
            console.log(error)
         }
      },
      [user.email]
   )

   return (
      <>
         <Grid
            container
            spacing={2}
            justifyContent="center"
            data-testid="registration-interests-information-step"
         >
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Select your interests
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <MultiListSelect
                  inputName={SELECTED_INTERESTS_FIELD_NAME}
                  isCheckbox
                  limit={5}
                  selectedItems={inputValues[SELECTED_INTERESTS_FIELD_NAME]}
                  allValues={allInterests}
                  setFieldValue={handleSelectedInterestsChange}
                  inputProps={multiSelectInputProps}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={multiSelectChipProps}
               />
            </Grid>
         </Grid>
      </>
   )
}

const multiSelectInputProps = {
   label: "Select 5 to improve your site experience",
   placeholder: "Select from the following list",
   className: "registrationInput",
}

const multiSelectChipProps = {
   color: "primary",
}

export default InterestsInformation
