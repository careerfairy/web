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

const SocialInformation = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const [existingReferralCode] = useLocalStorage(
      localStorageReferralCode,
      "",
      { raw: true }
   )

   const [referralCode, setReferralCode] = useState(existingReferralCode)
   const [linkedInLink, setLinkedInLink] = useState("")

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
         setLinkedInLink(linkedinUrl)
         setReferralCode(referralCode)
      }
   }, [userData])

   const handleLinkedInLinkChange = useCallback(
      (link: string) => {
         const fieldToUpdate = {
            linkedInLink: link,
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

   const handleReferralCodeChange = useCallback(
      (code: string) => {
         const fieldToUpdate = {
            referralCode: code,
         }
         updateFields(fieldToUpdate).catch(console.error)
      },
      [updateFields]
   )

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
               <FormControl fullWidth>
                  <TextField
                     className="registrationInput"
                     variant="outlined"
                     fullWidth
                     id="linkedInLink"
                     name="linkedInLink"
                     placeholder="Enter your LinkedIn link"
                     InputLabelProps={{ shrink: true }}
                     onChange={({ target: { value } }) => {
                        handleLinkedInLinkChange(value)
                     }}
                     value={linkedInLink}
                     label="Add your LinkedIn link here"
                  />
               </FormControl>
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
                        handleReferralCodeChange(value)
                     }}
                     value={referralCode}
                     label="Copy-paste here your referral code"
                  />
               </FormControl>
            </Grid>
         </Grid>
      </>
   )
}

export default SocialInformation
