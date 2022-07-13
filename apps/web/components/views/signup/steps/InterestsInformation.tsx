import { sxStyles } from "../../../../types/commonTypes"
import { Grid, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import MultiListSelect from "../../common/MultiListSelect"
import { useInterests } from "../../../custom-hook/useCollection"
import { useAuth } from "../../../../HOCs/AuthProvider"
import userRepo from "../../../../data/firebase/UserRepository"
import { formatToOptionArray, mapOptions, Option } from "../utils"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   headerWrapper: {
      marginBottom: 6,
      textAlign: "center",
   },
   title: {
      fontFamily: "Poppins",
      fontWeight: 400,
      fontSize: "46px",
      lineHeight: "63px",
      textAlign: "center",
      letterSpacing: "-0.02em",
      marginTop: 6,
   },
   subtitle: {
      fontSize: "1.1rem",
      fontWeight: 400,
      lineHeight: "29px",
      letterSpacing: "-0.02em",
   },
})

export const renderInterestsInformationStepTitle = () => (
   <Grid sx={styles.headerWrapper}>
      <Typography sx={styles.title}>Before we kick off...</Typography>
   </Grid>
)

const InterestsInformation = () => {
   const { data: allInterests } = useInterests()
   const { authenticatedUser: user, userData } = useAuth()

   const [selectedInterests, setSelectedInterests] = useState([] as Option[])

   useEffect(() => {
      if (userData) {
         const { interestsIds } = userData

         setSelectedInterests(formatToOptionArray(interestsIds, allInterests))
      }
   }, [userData, allInterests])

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

   const handleSelectedInterestsChange = useCallback(
      (selectedInterests: Option[]) => {
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
            </Grid>
         </Grid>
      </>
   )
}

export default InterestsInformation
