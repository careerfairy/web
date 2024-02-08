import { FC } from "react"
import { useFormikContext } from "formik"
import { sxStyles } from "types/commonTypes"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import { BrandedTextFieldProps } from "components/views/common/inputs/BrandedTextField"
import {
   BrandedAutocompleteProps,
   FormBrandedAutocomplete,
} from "components/views/common/inputs/BrandedAutocomplete"

const styles = sxStyles({
   input: {
      ".MuiInputBase-root": {
         paddingX: "12px",
      },
      input: {
         padding: "0 !important",
      },
   },
})

type MultiChipSelectProps = {
   keyOptionIndexer?: string
   textFieldProps?: BrandedTextFieldProps
} & BrandedAutocompleteProps

const MultiChipSelect: FC<MultiChipSelectProps> = ({
   keyOptionIndexer,
   textFieldProps,
   ...props
}) => {
   const { id, value, multiple } = props

   const { label, required, placeholder } = textFieldProps
   const { validateField, setFieldValue } = useFormikContext()

   const showPlaceholder = !multiple || value?.length === 0

   return (
      <FormBrandedAutocomplete
         name={id}
         isOptionEqualToValue={(option, value) => {
            const indexer = keyOptionIndexer || "id"
            return option[indexer] === value?.[indexer]
         }}
         getOptionLabel={(option) => option.name || ""}
         sx={BaseStyles.chipInput}
         textFieldProps={{
            name: id,
            label: label,
            fullWidth: true,
            requiredText: required && "(required)",
            placeholder: showPlaceholder ? placeholder : undefined,
            sx: styles.input,
         }}
         onChange={async (_, selectedOption) => {
            const newValue = keyOptionIndexer
               ? selectedOption?.[keyOptionIndexer]
               : selectedOption
            await setFieldValue(id, newValue)
            await validateField(id)
         }}
         {...props}
      />
   )
}

export default MultiChipSelect
