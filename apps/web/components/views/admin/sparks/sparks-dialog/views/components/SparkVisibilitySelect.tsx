import { Box, ListItemText, MenuItem, SelectProps } from "@mui/material"
import BrandedRadio from "components/views/common/inputs/BrandedRadio"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { useField } from "formik"
import { FC } from "react"

type Props = {
   name: string
}

const SparkVisibilitySelect: FC<Props> = ({ name }) => {
   const [field, meta] = useField<"true" | "false">(name)

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
            <MenuItem key={option.value} value={option.value}>
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
            {value === "true" ? "Public on CareerFairy" : "Private"}
         </Box>
      )
   },
}

export const publishedOptions = [
   { value: "true", label: "Public on CareerFairy" },
   { value: "false", label: "Private" },
] as const

export default SparkVisibilitySelect
