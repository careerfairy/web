import { TextField } from "@mui/material"
import React, { useCallback } from "react"
import { useDebounce } from "react-use"
import { linkedInRegex } from "../../../../constants/forms"

const LinkedInInput = ({ linkedInValue, onUpdateField, onChange }: Props) => {
   const [] = useDebounce(() => handleLinkedInDebounced(linkedInValue), 1000, [
      linkedInValue,
   ])

   const handleLinkedInDebounced = useCallback((linkedInLink) => {
      if (linkedInLink) {
         const fieldToUpdate = {
            linkedinUrl: isValidLinkedInLink(linkedInLink) ? linkedInLink : "",
         }
         onUpdateField(fieldToUpdate)
      }
   }, [])

   return (
      <TextField
         className="registrationInput"
         variant="outlined"
         fullWidth
         id="linkedInLink"
         name="linkedInLink"
         placeholder="Enter your LinkedIn link"
         InputLabelProps={{ shrink: true }}
         onChange={onChange}
         value={linkedInValue}
         label="Add your LinkedIn link here"
         error={!!linkedInValue.length && !isValidLinkedInLink(linkedInValue)}
      />
   )
}

const isValidLinkedInLink = (link: string): boolean => {
   return linkedInRegex.test(link)
}

type Props = {
   linkedInValue: string
   onUpdateField: (field) => void
   onChange: (event) => void
}

export default LinkedInInput
