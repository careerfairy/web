import {
   AutocompleteInputChangeReason,
   AutocompleteProps,
   ListItemText,
   MenuItem,
} from "@mui/material"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import {
   BrandedAutocompleteProps,
   FormBrandedAutocomplete,
} from "components/views/common/inputs/BrandedAutocomplete"
import { BrandedCheckbox } from "components/views/common/inputs/BrandedCheckbox"
import { BrandedTextFieldProps } from "components/views/common/inputs/BrandedTextField"
import { useFormikContext } from "formik"
import {
   SyntheticEvent,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import { SELECT_ALL_ID } from "../../../commons"

const styles = sxStyles({
   input: {
      ".MuiInputBase-root": {
         paddingX: "12px",
      },
      input: {
         padding: "0 !important",
      },
   },
   selectAll: {
      menuItem: {
         "&[aria-selected='true']": {
            backgroundColor: "#FAFAFA !important",
         },
      },
      text: {
         padding: "16px",
      },
   },
})

type MultiChipSelectProps = {
   keyOptionIndexer?: string
   textFieldProps?: BrandedTextFieldProps
   selectAllFieldLabel?: string
} & BrandedAutocompleteProps &
   Pick<AutocompleteProps<unknown, boolean, boolean, boolean>, "renderTags">

const MultiChipSelect = ({
   keyOptionIndexer,
   textFieldProps,
   selectAllFieldLabel,
   ...props
}: MultiChipSelectProps) => {
   const { id, value, options, multiple } = props

   const { label, required, placeholder } = textFieldProps
   const { validateField, setFieldValue } = useFormikContext()
   const [selectedAll, setSelectedAll] = useState(false)

   const selectAllOption = useMemo(() => {
      return {
         id: SELECT_ALL_ID,
         name: selectAllFieldLabel,
      }
   }, [selectAllFieldLabel])

   const showPlaceholder = !multiple || value?.length === 0

   const isOptionEqualToValueHandler = (option, value) => {
      const indexer = keyOptionIndexer || "id"
      return option[indexer] === value?.[indexer]
   }

   const onChangeHandler = async (_, selectedOption) => {
      if (
         Array.isArray(selectedOption) &&
         selectedOption.some((option) => option.id === selectAllOption.id)
      ) {
         setSelectedAll(false)
         const filteredOptions = selectedOption.filter(
            (option) => option.id !== selectAllOption.id
         )
         const newValue = keyOptionIndexer
            ? filteredOptions.map((option) => option[keyOptionIndexer])
            : filteredOptions
         await setFieldValue(id, newValue)
      } else {
         const newValue = keyOptionIndexer
            ? selectedOption?.[keyOptionIndexer]
            : selectedOption
         await setFieldValue(id, newValue)
      }
      await validateField(id)
   }

   const onChangeSelectAll = useCallback(async () => {
      setSelectedAll((currentSelectedAll) => {
         const newSelectedAll = !currentSelectedAll
         const newValue = newSelectedAll ? [selectAllOption] : []
         setFieldValue(id, newValue)
         return newSelectedAll
      })
   }, [id, selectAllOption, setFieldValue])

   const onInputChangeHandler = useCallback(
      (
         event: SyntheticEvent,
         value: string,
         reason: AutocompleteInputChangeReason
      ) => {
         if (reason === "clear") {
            setSelectedAll(false)
         }
      },
      []
   )

   const selectAllOptionComponent = useMemo(
      () =>
         selectAllFieldLabel ? (
            <MenuItem
               key={`${id}-select-all`}
               sx={styles.selectAll.menuItem}
               onMouseDown={onChangeSelectAll}
            >
               <ListItemText
                  key={`${id}-select-all-text`}
                  primary={selectAllFieldLabel}
                  sx={styles.selectAll.text}
               />
               <BrandedCheckbox checked={selectedAll} />
            </MenuItem>
         ) : null,
      [id, onChangeSelectAll, selectAllFieldLabel, selectedAll]
   )

   useEffect(() => {
      if (!selectAllFieldLabel) return

      if (value.length > 0 && value.length == options.length) {
         setSelectedAll(true)
         setFieldValue(id, [selectAllOption])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [options, setFieldValue, value])

   return (
      <FormBrandedAutocomplete
         name={id}
         isOptionEqualToValue={isOptionEqualToValueHandler}
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
         onChange={onChangeHandler}
         initialOptionSection={selectAllOptionComponent}
         onInputChange={onInputChangeHandler}
         {...props}
      />
   )
}

export default MultiChipSelect
