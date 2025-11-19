import CheckBoxIcon from "@mui/icons-material/CheckBox"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import {
   Checkbox,
   CircularProgress,
   Collapse,
   FormControl,
   FormHelperText,
   TextField,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { makeStyles } from "@mui/styles"
import React, { Dispatch, memo } from "react"
import isEqual from "react-fast-compare"

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const useStyles = makeStyles({
   option: {
      '&[aria-selected="true"]': {
         backgroundColor: "white!important",
      },
      '&[aria-selected="true"].Mui-focused': {
         backgroundColor: "white!important",
      },
      "&:hover": {
         backgroundColor: "action.hover",
      },
   },
})

// Default prop values to avoid creating new references on each render
const defaultOnSelectItem = () => {}
const defaultGetLabelFn = (option: { [key: string]: any }) => option.name
const defaultSetFieldValue = () => {}
const defaultGetValueFn = (option: { [key: string]: any }) => option.id
const defaultGetKeyFn = (option: { [key: string]: any }) => option.id
const defaultGetGroupByFn = () => ""
const defaultExtraOptions = {}
const defaultDisabledValues: string[] = []

const SingleListSelect = <T extends { [key: string]: any }>({
   inputName,
   options,
   selectedItem = null,
   onSelectItem = defaultOnSelectItem,
   disabled = false,
   getLabelFn = defaultGetLabelFn, // displayed name
   inputProps,
   isCheckbox = false, // Select items are checkboxes
   checkboxProps,
   extraOptions = defaultExtraOptions, // props to pass to autocomplete
   setFieldValue = defaultSetFieldValue, // formik field
   getValueFn = defaultGetValueFn, // field value
   getKeyFn = defaultGetKeyFn, // field id
   getGroupByFn = defaultGetGroupByFn,
   disabledValues = defaultDisabledValues,
   loading,
   noColorOnSelect,
}: Props<T>) => {
   const styles = useStyles()
   const handleSelect = (event, selectedOption) => {
      if (onSelectItem) {
         onSelectItem(selectedOption)
      }
      if (setFieldValue) {
         setFieldValue(
            inputName,
            selectedOption ? getValueFn(selectedOption) : null
         )
      }
   }

   const isOptionEqualToValue = (option, value) => {
      return getKeyFn(option) === getKeyFn(value)
   }

   const getOptionDisabled = (option) => {
      return disabledValues.includes(getKeyFn(option))
   }

   return (
      <Autocomplete
         classes={{
            option: noColorOnSelect ? styles.option : null,
         }}
         id={inputName}
         multiple={false}
         value={selectedItem}
         disabled={disabled}
         loading={loading}
         onChange={handleSelect}
         blurOnSelect
         isOptionEqualToValue={isOptionEqualToValue}
         disableCloseOnSelect={isCheckbox ? true : undefined}
         options={options}
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
                     {...checkboxProps}
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
            <FormControl error={Boolean(inputProps?.error)} fullWidth>
               <TextField
                  {...params}
                  {...inputProps}
                  name={inputName}
                  InputProps={{
                     ...params.InputProps,
                     endAdornment: (
                        <React.Fragment>
                           {loading ? (
                              <CircularProgress color="inherit" size={20} />
                           ) : null}
                           {params.InputProps.endAdornment}
                        </React.Fragment>
                     ),
                  }}
               />
               <Collapse in={Boolean(inputProps?.error)}>
                  <FormHelperText>{inputProps?.error}</FormHelperText>
               </Collapse>
            </FormControl>
         )}
         groupBy={getGroupByFn}
         {...extraOptions}
      />
   )
}

interface Props<T> {
   inputName: string
   setFieldValue?: (name, value) => void
   onSelectItem?: Dispatch<any>
   selectedItem: T
   disabled?: boolean
   getLabelFn?: (obj: T) => string
   getValueFn?: (obj: T) => T
   getKeyFn?: (obj: T) => string
   getGroupByFn?: (obj: T) => string
   inputProps?: any
   isCheckbox?: boolean
   checkboxProps?: any
   options: T[]
   extraOptions?: object
   disabledValues?: string[]
   loading?: boolean
   noColorOnSelect?: boolean
}

export default memo(SingleListSelect, isEqual)
