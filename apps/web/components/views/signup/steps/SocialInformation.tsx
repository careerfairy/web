import { Grid, TextField, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { useLocalStorage } from "react-use"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import userRepo from "../../../../data/firebase/UserRepository"
import { linkedInRegex } from "../../../../constants/forms"

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
})

export const renderSocialInformationStepTitle = () => (
   <Grid sx={styles.headerWrapper}>
      <Typography sx={styles.title}>Before we kick off...</Typography>
   </Grid>
)

const isValidLinkedInLink = (link: string): boolean => {
   return linkedInRegex.test(link)
}

const SocialInformation = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const [existingReferralCode] = useLocalStorage(
      localStorageReferralCode,
      "",
      { raw: true }
   )

   const [referralCodeInput, setReferralCodeInput] =
      useState(existingReferralCode)
   const [linkedInLinkInput, setLinkedInLinkInput] = useState("")
   const linkedInRef = useRef()
   const referralCodeRef = useRef()

   useEffect(() => {
      return () => {
         const lastLinkedInInput = linkedInRef.current
         const lastReferralCodeInput = referralCodeRef.current

         if (
            lastLinkedInInput !== undefined &&
            isValidLinkedInLink(lastLinkedInInput)
         ) {
            const fieldToUpdate = {
               linkedinUrl: lastLinkedInInput,
            }
            updateFields(fieldToUpdate).catch(console.error)
         }

         if (lastReferralCodeInput !== undefined) {
            const fieldToUpdate = {
               referralCode: lastReferralCodeInput,
            }
            updateFields(fieldToUpdate).catch(console.error)
         }
      }
   }, [])

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

   useEffect(() => {
      if (userData) {
         const { referralCode, linkedinUrl } = userData

         if (linkedinUrl !== linkedInLinkInput) {
            setLinkedInLinkInput(linkedinUrl || "")
         }

         if (referralCode !== referralCodeInput) {
            setReferralCodeInput(referralCode || "")
         }
      }
   }, [userData])

   const handleLinkedInLinkInputChange = useCallback((value) => {
      setLinkedInLinkInput(value)
      linkedInRef.current = value
   }, [])

   const handleReferralCodeInputChange = useCallback((value) => {
      setReferralCodeInput(value)
      referralCodeRef.current = value
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
               <TextField
                  className="registrationInput"
                  variant="outlined"
                  fullWidth
                  id="linkedInLink"
                  name="linkedInLink"
                  placeholder="Enter your LinkedIn link"
                  InputLabelProps={{ shrink: true }}
                  onChange={({ target: { value } }) => {
                     handleLinkedInLinkInputChange(value)
                  }}
                  value={linkedInLinkInput}
                  label="Add your LinkedIn link here"
                  error={
                     linkedInLinkInput.length > 0 &&
                     !isValidLinkedInLink(linkedInLinkInput)
                  }
               />
            </Grid>

            <Grid item xs={12} sm={8}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a referral code?
               </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
               <TextField
                  className="registrationInput"
                  variant="outlined"
                  fullWidth
                  id="referralCode"
                  name="referralCode"
                  placeholder="Enter a Referral Code"
                  InputLabelProps={{ shrink: true }}
                  onChange={({ target: { value } }) => {
                     handleReferralCodeInputChange(value)
                  }}
                  value={referralCodeInput}
                  label="Copy-paste here your referral code"
               />
            </Grid>
         </Grid>
      </>
   )
}

export default SocialInformation
