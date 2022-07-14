import { Grid, TextField, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { useLocalStorage } from "react-use"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import userRepo from "../../../../data/firebase/UserRepository"
import { linkedInRegex } from "../../../../constants/forms"
import { useDebounceInput } from "../../../custom-hook/useDebouce"
import { ReferralData } from "@careerfairy/shared-lib/dist/users"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

const isValidLinkedInLink = (link: string): boolean => {
   return linkedInRegex.test(link)
}

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

   const debouncedLinkedIn = useDebounceInput(linkedInLinkInput)
   const debouncedReferralCode = useDebounceInput(referralCodeInput)

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
      if (debouncedLinkedIn) {
         const fieldToUpdate = {
            linkedinUrl: isValidLinkedInLink(debouncedLinkedIn)
               ? debouncedLinkedIn
               : "",
         }
         updateFields(fieldToUpdate).catch(console.error)
      }
   }, [debouncedLinkedIn])

   useEffect(() => {
      if (debouncedReferralCode) {
         userRepo
            .getUserByReferralCode(debouncedReferralCode)
            .then((referralUser) => {
               const { id, firstName, lastName } = referralUser

               if (referralUser && id !== currentUser.email) {
                  const fieldToUpdate = {
                     referredBy: {
                        uid: id,
                        name: `${firstName} ${lastName}`,
                     } as ReferralData,
                  }

                  setIsValidReferralCode(true)
                  updateFields(fieldToUpdate).catch(console.error)
               }
            })
            .catch(() => {
               // to reset the referredBy field on db
               if (isValidReferralCode) {
                  const fieldToUpdate = {
                     referredBy: {},
                  }
                  updateFields(fieldToUpdate).catch(console.error)
               }

               console.warn(
                  `Invalid referral code: ${debouncedReferralCode}, no corresponding user.`
               )
            })

         setIsValidReferralCode(false)
      }
   }, [debouncedReferralCode])

   useEffect(() => {
      if (userData) {
         const { linkedinUrl } = userData

         if (linkedinUrl && linkedInLinkInput === "") {
            setLinkedInLinkInput(linkedinUrl || "")
         }
      }
   }, [userData])

   const handleLinkedInLinkInputChange = useCallback((value) => {
      setLinkedInLinkInput(value)
   }, [])

   const handleReferralCodeInputChange = useCallback((value) => {
      setReferralCodeInput(value)
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
                     linkedInLinkInput.length &&
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
                  error={referralCodeInput.length && !isValidReferralCode}
               />
            </Grid>
         </Grid>
      </>
   )
}

export default SocialInformation
