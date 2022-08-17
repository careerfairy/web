import { TextField } from "@mui/material"
import React, { useCallback } from "react"
import { useDebounce } from "react-use"
import { linkedInRegex } from "../../../../constants/forms"

const LinkedInInput = ({
   name,
   linkedInValue,
   onUpdateField,
   onChange,
}: Props) => {
   const [] = useDebounce(() => handleLinkedInDebounced(linkedInValue), 1000, [
      linkedInValue,
   ])

   const handleLinkedInDebounced = useCallback(
      (linkedInLink: string) => {
         if (linkedInLink.length === 0) {
            onUpdateField({ linkedinUrl: "" })
         } else if (isValidLinkedInLink(linkedInLink)) {
            onUpdateField({ linkedinUrl: linkedInLink })
         }
      },
      [onUpdateField]
   )

   return (
      <TextField
         className="registrationInput"
         variant="outlined"
         fullWidth
         id={name}
         name={name}
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
   name: string
   linkedInValue: string
   onUpdateField: (field) => void
   onChange: (event) => void
}

export default LinkedInInput
