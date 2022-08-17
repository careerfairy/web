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
   onSelectItems = () => {},
   disabled = false,
   getLabelFn = (option) => option.name, // displayed name
   inputProps = {},
   isCheckbox = false, // Select items are checkboxes
   chipProps = {},
   extraOptions = {}, // props to pass to autocomplete
   setFieldValue = () => {}, // formik field
   getValueFn = (option) => option.id, // field value
   getKeyFn = (option) => option.id, // field id
   getGroupByFn = () => "",
   disabledValues = [],
   limit = false,
}: Props) => {
   const handleMultiSelect = (event, selectedOptions) => {
      onSelectItems?.(selectedOptions)
      if (setFieldValue)
         setFieldValue(inputName, selectedOptions.map(getValueFn))
   }

   const isOptionEqualToValue = (option, value) => {
      // the option/value can be objects, we compare their string representation
      return (
         JSON.stringify(getValueFn(option)) ===
         JSON.stringify(getValueFn(value))
      )
   }

   const getOptionDisabled = (option) => {
      let limitWasReached = false

      if (limit) {
         limitWasReached =
            selectedItems.length >= limit && !selectedItems.includes(option)
      }

      return limitWasReached || disabledValues.includes(getValueFn(option))
   }

   return (
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
               <li
                  {...props}
                  data-testid={`${inputName}_${getKeyFn(option)}_option`}
                  key={getKeyFn(option)}
                  style={{ justifyContent: "space-between" }}
               >
                  {getLabelFn(option)}
                  <Checkbox
                     key={getKeyFn(option)}
                     icon={icon}
                     checkedIcon={checkedIcon}
                     checked={selected}
                  />
               </li>
            ) : (
               <li
                  {...props}
                  data-testid={`${inputName}_${getKeyFn(option)}_option`}
                  key={getKeyFn(option)}
               >
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
                  key={getKeyFn(option)}
                  label={getLabelFn(option)}
                  {...getTagProps({ index })}
                  {...chipProps}
                  disabled={getOptionDisabled(option)}
               />
            ))
         }
         groupBy={getGroupByFn}
         {...extraOptions}
      />
   )
}

type Props = {
   inputName: string
   setFieldValue?: (name, value) => void
   onSelectItems?: Dispatch<any>
   selectedItems: any[]
   disabled?: boolean
   getLabelFn?: (obj: any) => string
   getValueFn?: (obj: any) => string
   getKeyFn?: (obj: any) => string
   getGroupByFn?: (obj: any) => string
   inputProps?: object
   chipProps?: object
   isCheckbox?: boolean
   allValues: any[]
   extraOptions?: object
   disabledValues?: string[]
   limit?: number | false
}

export default memo(MultiListSelect, isEqual)
