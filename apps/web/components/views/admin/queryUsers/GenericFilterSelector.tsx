import React, { Dispatch, SetStateAction, useCallback, useMemo } from "react"
import { TextField } from "@mui/material"
import VirtualizedAutocomplete from "../../common/VirtualizedAutocomplete"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/dist/bigQuery/types"
import { sxStyles } from "../../../../types/commonTypes"

type Entry = {
   name: string
   id: string
}

interface Props<T> {
   entries: T[]
   fieldName: keyof BigQueryUserQueryOptions["filters"]
   noOptionsText: string
   inputPlaceholderText: string
   setOptions: Dispatch<SetStateAction<BigQueryUserQueryOptions>>
   queryOptions: BigQueryUserQueryOptions
   sx?: object
}

const styles = sxStyles({
   root: { minWidth: 300 },
})

const GenericFilterSelector = <T extends Entry>({
   entries,
   fieldName,
   noOptionsText,
   inputPlaceholderText,
   setOptions,
   queryOptions,
   sx,
}: Props<T>) => {
   const filtered = useMemo(
      () =>
         entries.filter((entry) =>
            queryOptions.filters[fieldName].includes(entry.id)
         ),
      [entries, fieldName, queryOptions.filters]
   )

   const onChange = useCallback(
      (event, items) => {
         setOptions((prev) => ({
            ...prev,
            filters: {
               ...prev.filters,
               [fieldName]: items.map((item) => item.id),
            },
            page: 0,
         }))
      },
      [fieldName, setOptions]
   )

   const renderInput = useCallback(
      (params) => (
         <TextField {...params} name={fieldName} label={inputPlaceholderText} />
      ),
      [fieldName, inputPlaceholderText]
   )

   const sxToApply = useMemo(() => {
      return Object.assign({}, styles.root, sx)
   }, [sx])

   return (
      <VirtualizedAutocomplete // must use VirtualizedAutocomplete to avoid performance issues, page freezes when using non-virtualized autocomplete
         options={entries}
         disableCloseOnSelect
         value={filtered}
         multiple
         openOnFocus
         freeSolo={false} // must be false to avoid typescript error, if left undefined, T could be T | string, but we only want T
         noOptionsText={noOptionsText}
         onChange={onChange}
         isOptionEqualToValue={isOptionEqual}
         sx={sxToApply}
         getOptionLabel={getLabel}
         renderOption={renderOption}
         fullWidth
         size="small"
         renderInput={renderInput}
      />
   )
}

function renderOption(props, option) {
   return [props, option.name]
}

function isOptionEqual(option, value) {
   return option.id === value.id
}

function getLabel(option) {
   return option.name
}

export default GenericFilterSelector
