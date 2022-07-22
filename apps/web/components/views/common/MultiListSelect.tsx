import React, { Dispatch, memo } from "react"
import { Autocomplete, Checkbox, Chip, TextField } from "@mui/material"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import isEqual from "react-fast-compare"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const MultiListSelect = ({
   inputName,
   allValues,
   selectedItems = [],
   onSelectItems,
   disabled = false,
   getLabelFn = (option) => option.name, // displayed name
   inputProps = {},
   isCheckbox = false, // Select items are checkboxes
   chipProps = {},
   extraOptions = {}, // props to pass to autocomplete
   setFieldValue = null, // formik field
   getValueFn = (option) => option.id, // field value
   disabledValues = [],
   limit = false,
}: Props) => {
   const handleMultiSelect = (event, selectedOptions) => {
      if (limit && selectedOptions.length > limit) return

      onSelectItems?.(selectedOptions)
      if (setFieldValue)
         setFieldValue(inputName, selectedOptions.map(getValueFn))
   }

   const isOptionEqualToValue = (option, value) => {
      return getValueFn(option) === getValueFn(value)
   }

   const getOptionDisabled = (option) =>
      disabledValues.includes(getValueFn(option))

   return allValues.length === 0 ? null : (
      <Autocomplete
         id={inputName}
         multiple
         value={selectedItems}
         disabled={disabled}
         onChange={handleMultiSelect}
         isOptionEqualToValue={isOptionEqualToValue}
         disableCloseOnSelect={isCheckbox ? true : undefined}
         options={allValues}
         getOptionLabel={getLabelFn}
         renderOption={(props, option, { selected }) =>
            isCheckbox ? (
               <li {...props} key={option.id}>
                  <Checkbox
                     icon={icon}
                     checkedIcon={checkedIcon}
                     style={{ marginRight: 8 }}
                     checked={selected}
                  />
                  {getLabelFn(option)}
               </li>
            ) : (
               <li {...props} key={option.id}>
                  {getLabelFn(option)}
               </li>
            )
         }
         getOptionDisabled={getOptionDisabled}
         renderInput={(params) => (
            <TextField {...params} {...inputProps} name={inputName} />
         )}
         renderTags={(value, getTagProps) =>
            value.map((option, index) => (
               <Chip
                  key={index}
                  label={getLabelFn(option)}
                  {...getTagProps({ index })}
                  {...chipProps}
                  disabled={getOptionDisabled(option)}
               />
            ))
         }
         {...extraOptions}
      />
   )
}

type Props = {
   inputName: string
   setFieldValue?: (name, value) => void
   onSelectItems: Dispatch<any>
   selectedItems: any[]
   disabled?: boolean
   getLabelFn?: (obj: any) => string
   getValueFn?: (obj: any) => string
   inputProps?: object
   chipProps?: object
   isCheckbox?: boolean
   allValues: any[]
   extraOptions?: object
   disabledValues?: string[]
   limit?: number | false
}

export default memo(MultiListSelect, isEqual)
