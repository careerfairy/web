import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import { SparkLanguage } from "@careerfairy/shared-lib/sparks/sparks"
import { MenuItem, Typography } from "@mui/material"
import { languageCodesDict } from "components/helperFunctions/streamFormFunctions"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { mapOptions } from "components/views/signup/utils"
import { useField, useFormikContext } from "formik"
import { FC } from "react"
import { SparkFormValues } from "../hooks/useSparkFormSubmit"

type Props = {
   name: string
}

const SparkLanguageSelect: FC<Props> = ({ name }) => {
   const { isSubmitting } = useFormikContext<SparkFormValues>()
   const [field, meta, helpers] = useField<SparkLanguage>(name)

   const options = mapOptions(languageOptionCodes)
   return (
      <div>
         <BrandedTextField
            select
            label={"Language"}
            name={name}
            SelectProps={{
               displayEmpty: true,
               renderValue: (value: string) => {
                  return value ? (
                     languageCodesDict[value]["name"]
                  ) : (
                     <Typography color={"neutral.400"}>
                        E.g., English
                     </Typography>
                  )
               },
            }}
            disabled={isSubmitting}
            fullWidth
            value={field.value}
            error={Boolean(meta.touched && meta.error)}
            helperText={Boolean(meta.touched && meta.error) && meta.error}
         >
            {options.map((option) => (
               <MenuItem
                  key={option}
                  value={option}
                  onClick={() => helpers.setValue(option)}
               >
                  {languageCodesDict[option]["name"]}
               </MenuItem>
            ))}
         </BrandedTextField>
      </div>
   )
}

export default SparkLanguageSelect
