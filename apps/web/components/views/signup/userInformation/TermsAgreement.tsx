import {
   Checkbox,
   Collapse,
   FormControlLabel,
   FormHelperText,
   Typography,
} from "@mui/material"
import { FormikTouched } from "formik"
import Link from "next/link"
import { ChangeEvent } from "react"
import { MobileUtils } from "util/mobile.utils"

type Props = {
   value: boolean
   onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => void
   error?: any
   disabled?: boolean
   touched?: boolean | FormikTouched<any> | FormikTouched<any>[]
   // @ts-ignore
   onBlur?: (event: FocusEvent<HTMLButtonElement, Element>) => void
}
const TermsAgreement = ({
   onBlur,
   disabled,
   value,
   onChange,
   error,
   touched,
}: Props) => {
   return (
      <>
         <FormControlLabel
            control={
               <Checkbox
                  name="agreeTerm"
                  placeholder="Confirm Password"
                  onChange={onChange}
                  onBlur={onBlur}
                  checked={value}
                  disabled={disabled}
                  color="primary"
               />
            }
            label={
               <Typography style={{ fontSize: 12 }}>
                  I agree to the{" "}
                  <Link
                     href="/terms"
                     target={MobileUtils.webViewPresence() ? "_blank" : "_self"}
                  >
                     Terms & Conditions
                  </Link>{" "}
                  and I have taken note of the{" "}
                  <Link
                     href="/data-protection"
                     target={MobileUtils.webViewPresence() ? "_blank" : "_self"}
                  >
                     Data Protection Notice
                  </Link>
               </Typography>
            }
         />
         <Collapse in={Boolean(error && touched)}>
            <FormHelperText error>{error}</FormHelperText>
         </Collapse>
      </>
   )
}

export default TermsAgreement
