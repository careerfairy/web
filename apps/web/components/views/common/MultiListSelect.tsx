import React, { Dispatch, memo, useCallback, useEffect, useState } from "react"
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
   /**
    * Enables a "Select All" option
    * Check the type definition for more information
    */
   selectAllOption = null,
}: Props) => {
   const [allValuesLocal, setAllValuesLocal] = useState(allValues)
   const [selectedItemsLocal, setSelectedItemsLocal] = useState(selectedItems)

   // add select all option to the list
   useEffect(() => {
      if (selectAllOption) {
         setAllValuesLocal([selectAllOption.value, ...allValues])
      }
   }, [allValues, selectAllOption])

   const handleMultiSelect = useCallback(
      (event, selectedOptions) => {
         // data that will be sent to the parent components via setFieldValue, onSelectItems callbacks
         let dataToBubbleUp = selectedOptions

         // select all functionality logic
         if (selectAllOption) {
            const selectAllOptionIsSelected = selectedOptions.find((option) =>
               matchSelectAllOption(option, selectAllOption)
            )

            if (selectAllOptionIsSelected) {
               const selectAllOptionWasAlreadySelected =
                  selectedItemsLocal.find((option) =>
                     matchSelectAllOption(option, selectAllOption)
                  )

               // if was selected before and now user selects more items
               if (
                  selectAllOptionWasAlreadySelected &&
                  selectedOptions.length > 1
               ) {
                  // remove select all option
                  selectedOptions = selectedOptions.filter(
                     (option) => !matchSelectAllOption(option, selectAllOption)
                  )
                  dataToBubbleUp = selectedOptions
               }

               // if was not selected before, apply select all behaviour
               if (!selectAllOptionWasAlreadySelected) {
                  // select all will be the only option selected in the input
                  selectedOptions = [selectAllOption.value]

                  switch (selectAllOption.selectValueType) {
                     case "AllOptions":
                        dataToBubbleUp = allValues
                        break
                     case "OptionValue":
                        dataToBubbleUp = selectedOptions
                        break
                     case "ReturnValue":
                        dataToBubbleUp = selectAllOption.returnValue
                        break
                  }
               }
            }
         }

         setSelectedItemsLocal(selectedOptions)

         onSelectItems?.(dataToBubbleUp)
         if (setFieldValue)
            setFieldValue(inputName, dataToBubbleUp.map(getValueFn))
      },
      [
         selectedItemsLocal,
         getValueFn,
         inputName,
         setFieldValue,
         onSelectItems,
         selectAllOption,
         allValues,
      ]
   )

   // in case the user deselects all options, give priority to the received
   // selected items (there might be a default entry)
   useEffect(() => {
      if (selectedItemsLocal.length === 0 && selectedItems.length > 0) {
         setSelectedItemsLocal(selectedItems)
      }
   }, [selectedItems, selectedItemsLocal])

   const isOptionEqualToValue = useCallback(
      (option, value) => {
         // the option/value can be objects, we compare their string representation
         return (
            JSON.stringify(getValueFn(option)) ===
            JSON.stringify(getValueFn(value))
         )
      },
      [getValueFn]
   )

   const getOptionDisabled = useCallback(
      (option) => {
         let limitWasReached = false

         if (limit) {
            limitWasReached =
               selectedItemsLocal.length >= limit &&
               !selectedItemsLocal.includes(option)
         }

         return limitWasReached || disabledValues.includes(getValueFn(option))
      },
      [disabledValues, limit, getValueFn, selectedItemsLocal]
   )

   return (
      <Autocomplete
         id={inputName}
         multiple
         value={selectedItemsLocal}
         disabled={disabled}
         onChange={handleMultiSelect}
         isOptionEqualToValue={isOptionEqualToValue}
         disableCloseOnSelect={isCheckbox ? true : undefined}
         options={allValuesLocal}
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
   selectAllOption?: SelectAllOption
}

type SelectAllOption = {
   // usually is an object {name, id}
   value: any
   /**
    * The client can choose the selected values when the Select All option is choosen
    * OptionValue -> The value of the SelectAllOption.value will be selected (sent to setFieldValue for e.g)
    *   Useful when we have a dedicated value for the "Select All" option (e.g [], "all", etc)
    *
    * AllOptions -> An array with all the options (without the Select All option) will be selected
    *   [option1, option2, option3] etc
    *
    * ReturnValue -> The selected value will have the `returnValue` property value
    */
   selectValueType: "OptionValue" | "AllOptions" | "ReturnValue"
   returnValue?: any
}

/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/
const matchSelectAllOption = (option, selectAllOption) =>
   JSON.stringify(option) === JSON.stringify(selectAllOption.value)

export default memo(MultiListSelect, isEqual)
