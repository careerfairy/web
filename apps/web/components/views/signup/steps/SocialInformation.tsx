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

const SocialInformation = () => {
   const { authenticatedUser: currentUser, userData } = useAuth()
   const [existingReferralCode] = useLocalStorage(
      localStorageReferralCode,
      "",
      { raw: true }
   )

   const [referralCodeInput, setReferralCodeInput] =
      useState(existingReferralCode)
   const [linkedInLinkInput, setLinkedInLinkInput] = useState("")
   const [isValidReferralCode, setIsValidReferralCode] = useState(false)

   const updateFields = useCallback(
      async (fieldToUpdate) => {
         try {
            await userRepo.updateAdditionalInformation({
               userEmail: currentUser.email,
               ...fieldToUpdate,
            })
         } catch (error) {
            console.log(error)
         }
      },
      [currentUser]
   )

   useEffect(() => {
      if (userData) {
         const { linkedinUrl, referredBy } = userData

         if (linkedinUrl && linkedInLinkInput === "") {
            setLinkedInLinkInput(linkedinUrl || "")
         }

         if (referredBy) {
            setIsValidReferralCode(true)
            setReferralCodeInput(referredBy.referralCode)
         }
      }
   }, [userData])

   const handleLinkedInLinkInputChange = useCallback(
      ({ target: { value } }) => {
         setLinkedInLinkInput(value)
      },
      []
   )

   const handleReferralCodeInputChange = useCallback(
      ({ target: { value } }) => {
         setReferralCodeInput(value)
      },
      []
   )

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
                  linkedInValue={linkedInLinkInput}
                  onUpdateField={updateFields}
                  onChange={handleLinkedInLinkInputChange}
               />
            </Grid>

            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a referral code?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <ReferralCodeInput
                  referralCodeValue={referralCodeInput}
                  currentUser={currentUser}
                  onUpdateField={updateFields}
                  onChange={handleReferralCodeInputChange}
                  isValid={isValidReferralCode}
                  onSetIsValid={setIsValidReferralCode}
               />
            </Grid>
         </Grid>
      </>
   )
}

export default SocialInformation
