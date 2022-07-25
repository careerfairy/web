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

const InterestsInformation = () => {
   const { data: allInterests } = useInterests()
   const { authenticatedUser: user, userData } = useAuth()

   const [selectedInterests, setSelectedInterests] = useState<Option[]>([])

   useEffect(() => {
      if (userData) {
         const { interestsIds } = userData

         setSelectedInterests(formatToOptionArray(interestsIds, allInterests))
      }
   }, [userData, allInterests])

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

   const handleSelectedInterestsChange = useCallback(
      (name: string, selectedInterests: Option[]) => {
         const fieldToUpdate = {
            interestsIds: mapOptions(selectedInterests),
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
            data-testid="registration-interests-information-step"
         >
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Select your interests
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <MultiListSelect
                  inputName="interestsInput"
                  isCheckbox
                  limit={5}
                  selectedItems={selectedInterests}
                  allValues={allInterests}
                  setFieldValue={handleSelectedInterestsChange}
                  inputProps={{
                     label: "Select 5 to improve your site experience",
                     placeholder: "Select from the following list",
                     className: "registrationInput",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "primary",
                  }}
               />
            </Grid>
         </Grid>
      </>
   )
}

export default InterestsInformation
