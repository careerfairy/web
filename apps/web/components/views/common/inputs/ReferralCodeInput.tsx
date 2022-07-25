import { FormControl, FormHelperText, TextField } from "@mui/material"
import React, { useCallback } from "react"
import { useDebounce } from "react-use"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   inputLabel: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
   helperText: {
      marginTop: 1,
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

const ReferralCodeInput = ({
   name,
   referralCodeValue,
   onUpdateField,
   onChange,
   isValid,
   onSetIsValid,
}: Props) => {
   const { rewardSignUpFollower } = useFirebaseService()

   const [] = useDebounce(
      () => handleReferralCodeDebounced(referralCodeValue),
      1000,
      [referralCodeValue]
   )

   const handleReferralCodeDebounced = useCallback(
      async (referralCode) => {
         // if referral code input still not valid, we want to check if the new one is valid
         // after 1st validation of the referral code we do not want the user to insert a new onex
         if (referralCode && !isValid) {
            onSetIsValid(false)

            try {
               const { data: fieldToUpdate } = await rewardSignUpFollower(
                  referralCode
               )

               if (fieldToUpdate) {
                  onSetIsValid(true)
                  onUpdateField({ referredBy: fieldToUpdate })
               }
            } catch {
               console.error(
                  `Invalid referral code: ${referralCode}, no corresponding user.`
               )
            }
         }
      },
      [isValid, onSetIsValid, onUpdateField, rewardSignUpFollower]
   )

   return (
      <FormControl fullWidth>
         <TextField
            className="registrationInput"
            variant="outlined"
            fullWidth
            id={name}
            name={name}
            placeholder="Enter a Referral Code"
            InputLabelProps={{ shrink: true }}
            onChange={onChange}
            disabled={isValid}
            value={referralCodeValue}
            label="Copy-paste here your referral code"
            error={!!referralCodeValue.length && !isValid}
         />
         {isValid && (
            <FormHelperText
               sx={styles.helperText}
               id="referralCode-helper-text"
            >
               The referral code was successfully validated
            </FormHelperText>
         )}
      </FormControl>
   )
}

type Props = {
   name: string
   referralCodeValue: string
   onUpdateField: (field) => void
   onChange: (event) => void
   isValid: boolean
   onSetIsValid: (isValid: boolean) => void
}
export default ReferralCodeInput
