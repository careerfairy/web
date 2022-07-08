import { FormControl, Grid, TextField, Typography } from "@mui/material"
import { sxStyles } from "../../../../types/commonTypes"
import { useLocalStorage } from "react-use"
import { localStorageReferralCode } from "../../../../constants/localStorageKeys"
import React, { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import userRepo from "../../../../data/firebase/UserRepository"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   headerWrapper: {
      marginTop: 6,
      marginBottom: 6,
      textAlign: "center",
   },
   title: {
      fontWeight: 400,
      fontSize: "2.5rem",
      lineHeight: "63px",
      letterSpacing: "-0.02em",
   },
})

function useDebounceInput(value, delay) {
   const [debouncedValue, setDebouncedValue] = useState(value)
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedValue(value)
      }, delay)
      return () => {
         clearTimeout(handler)
      }
   }, [value, delay])
   return debouncedValue
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
   const [hasChanged, setHasChanged] = useState(false)
   const debouncedLinkedInLink = useDebounceInput(linkedInLinkInput, 1000)
   const debouncedReferralCode = useDebounceInput(referralCodeInput, 1000)

   useEffect(() => {
      if (hasChanged) {
         const fieldToUpdate = {
            linkedinUrl: debouncedLinkedInLink,
         }
         updateFields(fieldToUpdate).catch(console.error)
         setHasChanged(false)
      }
   }, [debouncedLinkedInLink])

   useEffect(() => {
      if (hasChanged) {
         const fieldToUpdate = {
            referralCode: debouncedReferralCode,
         }
         updateFields(fieldToUpdate).catch(console.error)
         setHasChanged(false)
      }
   }, [debouncedReferralCode])

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
            setLinkedInLinkInput(linkedinUrl)
         }

         if (referralCode !== referralCodeInput)
            setReferralCodeInput(referralCode || "")
      }
   }, [userData])

   const handleLinkedInLinkInputChange = useCallback((value) => {
      setLinkedInLinkInput(value)
      setHasChanged(true)
   }, [])

   const handleReferralCodeInputChange = useCallback((value) => {
      setReferralCodeInput(value)
      setHasChanged(true)
   }, [])

   return (
      <>
         <Grid sx={styles.headerWrapper}>
            <Typography sx={styles.title}>Before we kick off...</Typography>
         </Grid>

         <Grid container maxWidth="sm" mx={"auto"} spacing={2}>
            <Grid item xs={12}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a linkedin account?
               </Typography>
            </Grid>
            <Grid item xs={12}>
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
               />
            </Grid>

            <Grid item xs={12}>
               <Typography sx={styles.inputLabel} variant="h5">
                  Do you have a referral code?
               </Typography>
            </Grid>
            <Grid item xs={12}>
               <FormControl fullWidth>
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
               </FormControl>
            </Grid>
         </Grid>
      </>
   )
}

export default SocialInformation
