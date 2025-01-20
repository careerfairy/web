import { UserData } from "@careerfairy/shared-lib/dist/users"
import { Grid, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useLocalStorage } from "react-use"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import { userRepo } from "../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../types/commonTypes"
import LinkedInInput from "../../common/inputs/LinkedInInput"
import ReferralCodeInput from "../../common/inputs/ReferralCodeInput"

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
      async (fieldToUpdate: Partial<UserData>) => {
         try {
            await userRepo.updateAdditionalInformation(
               currentUser.email,
               fieldToUpdate
            )
         } catch (error) {
            errorLogAndNotify(error, {
               message: "Error updating social information in SignUp",
            })
         }
      },
      [currentUser]
   )

   useEffect(() => {
      if (userData) {
         const { linkedinUrl, referredBy } = userData

         if (linkedinUrl) {
            setInputValues((prev) => {
               if (prev[LINKEDIN_FIELD_NAME] !== "") {
                  return prev
               }
               return {
                  ...prev,
                  [LINKEDIN_FIELD_NAME]: linkedinUrl || "",
               }
            })
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
   )
}

export default SocialInformation
