import { Interest } from "@careerfairy/shared-lib/interests"
import { Chip, FormHelperText } from "@mui/material"
import Box from "@mui/material/Box"
import { useCallback } from "react"
import { StylesProps } from "../../../types/commonTypes"

interface InterestSelectProps {
   selectedInterests: Interest[]
   totalInterests: Interest[]
   error: string
   touched: boolean
   setFieldValue: (field: string, value: any) => void
   handleBlur: (event: any) => void
   disabled: boolean
   limit?: number
   id: string
}

const styles: StylesProps = {
   interestChip: {
      borderRadius: 1,
   },
}
const InterestSelect = ({
   selectedInterests,
   totalInterests,
   setFieldValue,
   error,
   touched,
   handleBlur,
   disabled,
   limit = 5,
   id,
}: InterestSelectProps) => {
   const hasError = Boolean(error && touched && error)
   const limitReached = selectedInterests.length >= limit
   const checkDisable = useCallback(
      (interest: Interest) =>
         (limitReached && !isInterestSelected(interest)) || disabled,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [limitReached, selectedInterests]
   )

   const handleClickInterest = useCallback(
      (interest: Interest) => {
         if (limitReached && !isInterestSelected(interest)) {
            return
         }
         // check if interest is already selected
         if (isInterestSelected(interest)) {
            // remove interest from selected interests
            setFieldValue(
               "interests",
               selectedInterests.filter(
                  (selectedInterest) => selectedInterest.id !== interest.id
               )
            )
         } else {
            // add interest to selected interests
            setFieldValue("interests", [...selectedInterests, interest])
         }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [selectedInterests, limitReached]
   )

   const isInterestSelected = useCallback(
      (interest: Interest) => {
         return selectedInterests.find(
            (selectedInterest) => selectedInterest.id === interest.id
         )
      },
      [selectedInterests]
   )
   return (
      <Box id={id}>
         {totalInterests.map((interest) => (
            <Chip
               sx={styles.interestChip}
               onClick={() => handleClickInterest(interest)}
               onBlur={() => handleBlur(id)}
               disabled={checkDisable(interest)}
               color={isInterestSelected(interest) ? "primary" : "default"}
               /*
               // @ts-ignore */
               variant={isInterestSelected(interest) ? "contained" : "outlined"}
               stacked={"true"}
               label={interest.name}
               key={interest.id}
            />
         ))}
         {Boolean(hasError && touched) && (
            <FormHelperText error>{error}</FormHelperText>
         )}
      </Box>
   )
}

export default InterestSelect
