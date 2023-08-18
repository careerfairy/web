import { Box, ListItemText, MenuItem, SelectProps } from "@mui/material"
import BrandedRadio from "components/views/common/inputs/BrandedRadio"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useField } from "formik"
import { FC, useCallback } from "react"

type Props = {
   name: string
   canPublishMoreSparks?: boolean
}

const SparkVisibilitySelect: FC<Props> = ({
   name,
   canPublishMoreSparks = true,
}) => {
   const [field, meta] = useField<"true" | "false">(name)

   const isOptionDisabled = useCallback(
      (option) => {
         // We only want to disable the option 'public on careerFairy' when the selected option is the 'hidden'
         return (
            option.value === "true" &&
            field.value === "false" &&
            !canPublishMoreSparks
         )
      },
      [canPublishMoreSparks, field]
   )

   return (
      <BrandedTextField
         name={name}
         label="Visibility"
         placeholder="Select Spark visibility"
         fullWidth
         select
         SelectProps={selectProps}
         {...field}
         error={meta.touched ? Boolean(meta.error) : null}
         helperText={meta.touched ? meta.error : null}
      >
         {publishedOptions.map((option) => (
            <MenuItem
               key={option.value}
               value={option.value}
               disabled={isOptionDisabled(option)}
            >
               <ListItemText primary={option.label} />
               <BrandedRadio checked={field.value === option.value} />
            </MenuItem>
         ))}
      </BrandedTextField>
   )
}

const selectProps: Partial<SelectProps> = {
   renderValue: (value) => {
      return (
         <Box component="span">
            {value === "true" ? "Public on CareerFairy" : "Hidden"}
         </Box>
      )
   },
}

export const publishedOptions = [
   { value: "true", label: "Public on CareerFairy", disabled: false },
   { value: "false", label: "Hidden", disabled: false },
] as const

export default SparkVisibilitySelect
