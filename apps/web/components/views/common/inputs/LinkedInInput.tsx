import { TextField } from "@mui/material"
import React, { useCallback } from "react"
import { useDebounce } from "react-use"
import { linkedInRegex } from "@careerfairy/shared-lib/constants/forms"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { UserData } from "@careerfairy/shared-lib/dist/users"

const LinkedInInput = ({
   name,
   linkedInValue,
   onUpdateField,
   onChange,
}: Props) => {
   const { errorNotification } = useSnackbarNotifications()

   useDebounce(() => handleLinkedInDebounced(linkedInValue), 1000, [
      linkedInValue,
   ])

   const handleLinkedInDebounced = useCallback(
      async (linkedInLink: string) => {
         if (linkedInLink.length === 0) {
            return await onUpdateField({ linkedinUrl: "" })
         }
         if (isValidLinkedInLink(linkedInLink)) {
            return await onUpdateField({ linkedinUrl: linkedInLink })
         }
         errorNotification("The chosen LinkedIn link is not valid!")
      },
      [errorNotification, onUpdateField]
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
      />
   )
}

const isValidLinkedInLink = (link: string): boolean => {
   return linkedInRegex.test(link)
}

type Props = {
   name: string
   linkedInValue: string
   onUpdateField: (field: Partial<UserData>) => Promise<void>
   onChange: (event) => void
}

export default LinkedInInput
