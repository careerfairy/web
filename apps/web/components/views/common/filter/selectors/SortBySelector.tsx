import { FormControl, IconProps, SelectChangeEvent } from "@mui/material"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { ResponsiveOption, ResponsiveSelect } from "../../ResponsiveSelect"
import DownIcon from "@mui/icons-material/ArrowDropDown"
import React, { useCallback, useMemo } from "react"
import { SortType } from "../FilterMenu"
import { useRouter } from "next/router"

type SelectProps = {
   id: string
   labelId: string
   value: SortType
   label: string
   handleChange: (event: SelectChangeEvent<string>) => void
   options: { value: SortType; label: string; descending: boolean }[]
}

const SortBySelector = () => {
   const { pathname, push, query } = useRouter()

   const handleQuery = useCallback(
      (queryParam: string, queryValue: string | string[]) => {
         const newQuery = {
            ...query,
            [queryParam]: Array.isArray(queryValue)
               ? queryValue.join(",")
               : queryValue,
            page: 0,
         }
         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [pathname, push, query]
   )

   const selects = useMemo<SelectProps[]>(
      () => [
         {
            id: "sort-select",
            labelId: "sort-select-label",
            // @ts-ignore
            value: Array.isArray(query.sortType)
               ? query.sortType[0]
               : query.sortType,
            label: "Sort by",
            handleChange: (event) => {
               handleQuery("sortType", event.target.value)
            },
            options: [
               {
                  value: "dateDesc",
                  label: "Date Descending (Newest First)",
                  descending: true,
               },
               {
                  value: "dateAsc",
                  label: "Date Ascending (Oldest First)",
                  descending: false,
               },
               {
                  value: "upvotesDesc",
                  label: "Upvotes Descending (Most Upvoted First)",
                  descending: true,
               },
               {
                  value: "upvotesAsc",
                  label: "Upvotes Ascending (Least Upvoted First)",
                  descending: false,
               },
            ],
         },
      ],
      [handleQuery, query.sortType]
   )

   return (
      <div key="sort-select">
         {selects.map((select) => (
            <FormControl key={select.id} variant={"outlined"} fullWidth>
               <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  spacing={2}
                  sx={{ mb: 1, height: "35px" }}
               >
                  <Typography
                     htmlFor={select.id}
                     component={"label"}
                     variant={"h6"}
                     id={select.labelId}
                  >
                     {select.label}
                  </Typography>
               </Stack>

               <ResponsiveSelect
                  labelId={select.labelId}
                  id={select.id}
                  displayEmpty
                  value={select.value || ""}
                  onChange={select.handleChange}
               >
                  <ResponsiveOption disabled value="">
                     Select an option
                  </ResponsiveOption>
                  {select.options.map((option) => (
                     <ResponsiveOption
                        key={option.value}
                        value={option.value}
                        icon={option.descending ? <DownIcon /> : <UpIcon />}
                     >
                        {option.label}
                     </ResponsiveOption>
                  ))}
               </ResponsiveSelect>
            </FormControl>
         ))}
      </div>
   )
}

const UpIcon = (props: IconProps) => (
   // @ts-ignore
   <DownIcon {...props} style={{ transform: "rotate(180deg)" }} />
)

export default SortBySelector
