import { Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { useLocalStorage } from "react-use"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import React, { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"
import ReferralCodeInput from "../../common/inputs/ReferralCodeInput"
import LinkedInInput from "../../common/inputs/LinkedInInput"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

const LINKEDIN_FIELD_NAME = "linkedInLink"
const REFERRAL_CODE_FIELD_NAME = "referralCode"

const SocialInformation = () => {
   const { authenticatedUser: currentUser, userData } = useAuth()
   const [existingReferralCode] = useLocalStorage(
      localStorageReferralCode,
      "",
      { raw: true }
   )

   const [inputValues, setInputValues] = useState({
      [LINKEDIN_FIELD_NAME]: "",
      [REFERRAL_CODE_FIELD_NAME]: existingReferralCode,
   })
   const [isValidReferralCode, setIsValidReferralCode] = useState(false)

   const updateFields = useCallback(
      async (fieldToUpdate) => {
         try {
            await userRepo.updateAdditionalInformation(
               currentUser.email,
               fieldToUpdate
            )
         } catch (error) {
            console.log(error)
         }
      },
      [currentUser]
   )

   useEffect(() => {
      if (userData) {
         const { linkedinUrl, referredBy } = userData

         if (linkedinUrl && inputValues[LINKEDIN_FIELD_NAME] === "") {
            setInputValues((prev) => ({
               ...prev,
               [LINKEDIN_FIELD_NAME]: linkedinUrl || "",
            }))
         }

         if (referredBy) {
            setIsValidReferralCode(true)
            setInputValues((prev) => ({
               ...prev,
               [REFERRAL_CODE_FIELD_NAME]: referredBy.referralCode,
            }))
         }
      }
   }, [userData])

   const handleInputChange = useCallback(({ target: { value, name } }) => {
      setInputValues((prev) => ({ ...prev, [name]: value }))
   }, [])

   return (
      <>
         <Grid
            container
            spacing={2}
            justifyContent="center"
            data-testid="registration-social-information-step"
         >
            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a linkedin account?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <LinkedInInput
                  name={LINKEDIN_FIELD_NAME}
                  linkedInValue={inputValues[LINKEDIN_FIELD_NAME]}
                  onUpdateField={updateFields}
                  onChange={handleInputChange}
               />
            </Grid>

            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a referral code?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <ReferralCodeInput
                  name={REFERRAL_CODE_FIELD_NAME}
                  referralCodeValue={inputValues[REFERRAL_CODE_FIELD_NAME]}
                  onChange={handleInputChange}
                  isValid={isValidReferralCode}
                  onSetIsValid={setIsValidReferralCode}
               />
            </Grid>
         </Grid>
      </>
   )
}

export default SocialInformation
