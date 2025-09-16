import {
   Autocomplete,
   AutocompleteProps,
   Box,
   CircularProgress,
   ListItemText,
   MenuItem,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useField } from "formik"
import {
   FC,
   ReactElement,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { BrandedCheckbox } from "./BrandedCheckbox"
import BrandedTextField, {
   BrandedTextFieldProps,
   FormBrandedTextField,
} from "./BrandedTextField"

/**
 * Configuration for lazy loading behavior
 */
export interface LazyLoadingConfig {
   /** Number of items to render initially */
   initialRenderCount?: number
   /** Number of items to load when scrolling near the end */
   loadMoreCount?: number
   /** Threshold (in pixels) from the bottom to trigger loading more */
   scrollThreshold?: number
}

type StyledLazyBrandedAutocompleteProps<
   T extends { id: string; name: string } = any
> = Omit<
   AutocompleteProps<T, boolean, boolean, boolean>,
   "renderTags" | "renderOption"
> & {
   textFieldProps?: BrandedTextFieldProps
   limit?: number
   initialOptionSection?: ReactElement
   getOptionElement?: (option: unknown) => ReactElement
   /** Lazy loading configuration */
   lazyConfig?: LazyLoadingConfig
}

export type LazyBrandedAutocompleteProps = Omit<
   StyledLazyBrandedAutocompleteProps,
   "renderInput"
> &
   Pick<AutocompleteProps<unknown, boolean, boolean, boolean>, "renderTags">

type LazyFormBrandedAutocompleteProps = LazyBrandedAutocompleteProps & {
   name: string
}

const StyledLazyBrandedAutocomplete = styled(
   ({
      limit,
      getOptionLabel,
      renderInput,
      initialOptionSection,
      getOptionElement,
      options,
      lazyConfig = {},
      ...props
   }: StyledLazyBrandedAutocompleteProps) => {
      const {
         initialRenderCount = 30,
         loadMoreCount = 30,
         scrollThreshold = 10,
      } = lazyConfig

      const [visibleCount, setVisibleCount] = useState(initialRenderCount)
      const [isLoadingMore, setIsLoadingMore] = useState(false)
      const listboxRef = useRef<HTMLDivElement>(null)
      const hasOptions = options.length > 0

      const newOptions = useMemo(() => {
         return hasOptions ? options : [{ title: "INITIAL_SECTION" }]
      }, [options, hasOptions])

      // Get visible options based on current count
      const visibleOptions = newOptions.slice(0, visibleCount)

      // Check if there are more options to load
      const hasMoreOptions = visibleCount < newOptions.length

      // Handle scroll to load more options
      const handleScroll = useCallback(
         (event: React.UIEvent<HTMLUListElement>) => {
            if (isLoadingMore || !hasMoreOptions) return

            const target = event.currentTarget
            const { scrollTop, scrollHeight, clientHeight } = target
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight

            if (distanceFromBottom <= scrollThreshold) {
               setIsLoadingMore(true)

               // Load more data immediately
               setVisibleCount((prev) => {
                  const newCount = Math.min(
                     prev + loadMoreCount,
                     newOptions.length
                  )
                  setIsLoadingMore(false)
                  return newCount
               })
            }
         },
         [
            isLoadingMore,
            hasMoreOptions,
            scrollThreshold,
            loadMoreCount,
            newOptions.length,
         ]
      )

      // Check if we need to load more content initially
      useEffect(() => {
         if (!hasMoreOptions) return

         const listbox = listboxRef.current
         if (!listbox) return

         // Use a small delay to ensure DOM is updated
         const timeoutId = setTimeout(() => {
            const { scrollHeight, clientHeight } = listbox
            if (scrollHeight <= clientHeight && hasMoreOptions) {
               // If content doesn't fill the container, load more
               setVisibleCount((prev) =>
                  Math.min(prev + loadMoreCount, newOptions.length)
               )
            }
         }, 100)

         return () => clearTimeout(timeoutId)
      }, [hasMoreOptions, loadMoreCount, newOptions.length, visibleCount])

      // Reset visible count when options change (e.g., search)
      useEffect(() => {
         setVisibleCount(initialRenderCount)
      }, [options, initialRenderCount])

      return (
         <Autocomplete
            getOptionDisabled={(optionEl) => {
               if (!props.multiple || !limit) return false
               return (
                  props.value?.length >= limit &&
                  !props.value?.find((item) => {
                     if (props.isOptionEqualToValue) {
                        return props.isOptionEqualToValue(item, optionEl)
                     }
                     return item === optionEl
                  })
               )
            }}
            options={visibleOptions}
            ListboxProps={{
               ref: listboxRef,
               onScroll: handleScroll,
            }}
            renderOption={(optionProps, option, { selected, index }) => (
               <>
                  {Boolean(index === 0 && initialOptionSection) &&
                     initialOptionSection}
                  {Boolean(hasOptions) && (
                     <MenuItem
                        {...optionProps}
                        key={JSON.stringify(option)}
                        sx={{
                           '&[aria-selected="true"]': {
                              backgroundColor: "#FAFAFA !important",
                           },
                        }}
                     >
                        {getOptionElement ? (
                           getOptionElement(option)
                        ) : (
                           <ListItemText
                              key={`${JSON.stringify(option)}-text`}
                              primary={getOptionLabel(option)}
                              sx={{ padding: "16px" }}
                           />
                        )}

                        {props.multiple ? (
                           <BrandedCheckbox checked={selected} />
                        ) : null}
                     </MenuItem>
                  )}
                  {/* Loading indicator at the bottom */}
                  {Boolean(
                     hasOptions &&
                        index === visibleOptions.length - 1 &&
                        hasMoreOptions &&
                        isLoadingMore
                  ) && (
                     <Box
                        sx={{
                           display: "flex",
                           justifyContent: "center",
                           alignItems: "center",
                           padding: "16px",
                        }}
                     >
                        <CircularProgress size={20} />
                     </Box>
                  )}
               </>
            )}
            {...props}
            color="primary"
            getOptionLabel={getOptionLabel}
            renderInput={renderInput}
         />
      )
   }
)({})

const LazyBrandedAutocomplete: FC<LazyBrandedAutocompleteProps> = ({
   textFieldProps,
   ...props
}) => {
   return (
      <StyledLazyBrandedAutocomplete
         {...props}
         renderInput={(params) => (
            <BrandedTextField {...params} {...textFieldProps} />
         )}
      />
   )
}

export const LazyFormBrandedAutocomplete: FC<
   LazyFormBrandedAutocompleteProps
> = ({ name, textFieldProps, ...props }) => {
   const [{ onBlur }, ,] = useField(name)

   const handleChange = async (...args) => {
      // If we follow TS validations we will be tied to props.onChange signature when we don't have to
      // @ts-ignore
      await props.onChange(...args)
      await onBlur({ target: { name } })
   }

   return (
      <StyledLazyBrandedAutocomplete
         renderInput={(params) => (
            <FormBrandedTextField
               name={name}
               autocomplete
               {...params}
               {...textFieldProps}
            />
         )}
         {...props}
         onChange={handleChange}
      />
   )
}

export default LazyBrandedAutocomplete
