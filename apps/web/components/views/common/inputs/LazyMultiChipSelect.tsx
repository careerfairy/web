import {
   AutocompleteInputChangeReason,
   AutocompleteProps,
   ListItemText,
   MenuItem,
} from "@mui/material"
import BaseStyles from "components/views/admin/company-information/BaseStyles"
import { BrandedCheckbox } from "components/views/common/inputs/BrandedCheckbox"
import { BrandedTextFieldProps } from "components/views/common/inputs/BrandedTextField"
import {
   LazyFormBrandedAutocomplete,
   LazyLoadingConfig,
} from "components/views/common/inputs/LazyFormBrandedAutocomplete"
import { SELECT_ALL_ID } from "components/views/group/admin/events/detail/form/commons"
import { useFormikContext } from "formik"
import {
   SyntheticEvent,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"

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

/**
 * Generic option type that all options must extend
 */
export interface BaseOption {
   id: string
   name: string
}

/**
 * Props for the lazy multi-chip select component
 */
export interface LazyMultiChipSelectProps<T extends BaseOption> {
   /** Unique identifier for the field */
   id: string
   /** Current selected values */
   value: T[] | T | null
   /** Available options to select from */
   options: T[]
   /** Whether multiple selection is allowed */
   multiple: boolean
   /** Function to group options (optional) */
   groupBy?: (option: T) => string
   /** Maximum number of items that can be selected */
   limit?: number
   /** Whether to disable closing on select */
   disableCloseOnSelect?: boolean
   /** Text field props */
   textFieldProps?: BrandedTextFieldProps
   /** Label for select all option */
   selectAllFieldLabel?: string
   /** Key to use for option indexing (default: 'id') */
   keyOptionIndexer?: keyof T
   /** Custom render function for tags */
   renderTags?: AutocompleteProps<T, boolean, boolean, boolean>["renderTags"]
   /** Lazy loading configuration */
   lazyConfig?: LazyLoadingConfig
   /** Custom option renderer */
   getOptionElement?: (option: T) => React.ReactElement
}

/**
 * Lazy loading multi-chip select component optimized for large datasets
 *
 * This component provides:
 * - Virtual scrolling for large option lists
 * - Lazy loading with configurable thresholds
 * - Search functionality with real-time filtering
 * - Multiple selection with chips
 * - Select all functionality
 * - Formik integration
 * - Fully typed without any/unknown
 * - Optimized performance for large datasets
 *
 * @template T - The type of options (must extend BaseOption)
 */
const LazyMultiChipSelect = <T extends BaseOption>({
   id,
   value,
   options,
   multiple,
   groupBy,
   limit,
   disableCloseOnSelect = false,
   textFieldProps,
   selectAllFieldLabel,
   keyOptionIndexer = "id" as keyof T,
   renderTags,
   lazyConfig,
   getOptionElement,
}: LazyMultiChipSelectProps<T>) => {
   const { label, required, placeholder } = textFieldProps || {}
   const { validateField, setFieldValue } = useFormikContext()
   const [selectedAll, setSelectedAll] = useState(false)
   const [searchTerm, setSearchTerm] = useState("")

   // Select all option
   const selectAllOption = useMemo(() => {
      return {
         id: SELECT_ALL_ID,
         name: selectAllFieldLabel || "Select All",
      } as T
   }, [selectAllFieldLabel])

   // Filter options based on search term - always search the full dataset
   const filteredOptions = useMemo(() => {
      if (!searchTerm) return options

      return options.filter((option) =>
         option.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
   }, [options, searchTerm])

   // Show placeholder only when no items are selected
   const showPlaceholder =
      !multiple || (Array.isArray(value) && value.length === 0)

   // Check if option equals value
   const isOptionEqualToValueHandler = useCallback(
      (option: T, val: T) => {
         return option[keyOptionIndexer] === val?.[keyOptionIndexer]
      },
      [keyOptionIndexer]
   )

   // Handle option selection
   const onChangeHandler = useCallback(
      async (_, selectedOption: T | T[] | null) => {
         if (Array.isArray(selectedOption)) {
            // Check if select all was selected
            if (
               selectedOption.some((option) => option.id === selectAllOption.id)
            ) {
               setSelectedAll(false)
               const filteredOptions = selectedOption.filter(
                  (option) => option.id !== selectAllOption.id
               )
               // Store full objects, not just the key values
               await setFieldValue(id, filteredOptions)
            } else {
               // Store full objects, not just the key values
               await setFieldValue(id, selectedOption)
            }
         } else {
            // Store full object, not just the key value
            await setFieldValue(id, selectedOption)
         }
         await validateField(id)
      },
      [id, selectAllOption, setFieldValue, validateField]
   )

   // Handle select all toggle
   const onChangeSelectAll = useCallback(async () => {
      setSelectedAll((currentSelectedAll) => {
         const newSelectedAll = !currentSelectedAll
         const newValue = newSelectedAll ? [selectAllOption] : []
         setFieldValue(id, newValue)
         return newSelectedAll
      })
   }, [id, selectAllOption, setFieldValue])

   // Handle input change (for search)
   const onInputChangeHandler = useCallback(
      (
         event: SyntheticEvent,
         value: string,
         reason: AutocompleteInputChangeReason
      ) => {
         if (reason === "clear") {
            setSelectedAll(false)
            setSearchTerm("")
         } else {
            setSearchTerm(value)
         }
      },
      []
   )

   // Select all option component
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

   // Prepare options with select all option
   const optionsWithSelectAll = useMemo(() => {
      const baseOptions = [...filteredOptions]

      // Add select all option at the beginning if enabled
      if (selectAllFieldLabel) {
         baseOptions.unshift(selectAllOption)
      }

      return baseOptions
   }, [filteredOptions, selectAllFieldLabel, selectAllOption])

   // Update selected all state when all options are selected
   useEffect(() => {
      if (!selectAllFieldLabel || !Array.isArray(value)) return

      if (value.length > 0 && value.length === options.length) {
         setSelectedAll(true)
         setFieldValue(id, [selectAllOption])
      }
   }, [options, setFieldValue, value, selectAllFieldLabel, selectAllOption, id])

   return (
      <LazyFormBrandedAutocomplete
         name={id}
         isOptionEqualToValue={isOptionEqualToValueHandler}
         getOptionLabel={(option: T) => option.name || ""}
         sx={BaseStyles.chipInput}
         textFieldProps={{
            name: id,
            label: label,
            fullWidth: true,
            requiredText: required && "(required)",
            placeholder: showPlaceholder ? placeholder : undefined,
            sx: styles.input,
         }}
         slotProps={{
            paper: {
               sx: {
                  my: 1,
               },
            },
            popper: {
               modifiers: [
                  {
                     name: "flip",
                     enabled: true,
                  },
                  {
                     name: "preventOverflow",
                     enabled: false,
                  },
               ],
            },
         }}
         onChange={onChangeHandler}
         onInputChange={onInputChangeHandler}
         options={optionsWithSelectAll}
         value={value}
         multiple={multiple}
         groupBy={groupBy}
         limit={limit}
         disableCloseOnSelect={disableCloseOnSelect}
         renderTags={renderTags}
         lazyConfig={lazyConfig}
         getOptionElement={getOptionElement}
         initialOptionSection={selectAllOptionComponent}
      />
   )
}

export default LazyMultiChipSelect
