import React, { useCallback, useMemo } from "react"
import {
   Button,
   Chip,
   FormControl,
   IconProps,
   Popover,
   SelectChangeEvent,
} from "@mui/material"
import Box from "@mui/material/Box"
import { wishListBorderRadius } from "../../../constants/pages"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/router"
import { ResponsiveOption, ResponsiveSelect } from "../common/ResponsiveSelect"
import { useInterests } from "../../custom-hook/useCollection"
import { StylesProps } from "../../../types/commonTypes"
import firebase from "firebase/compat/app"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import DownIcon from "@mui/icons-material/ArrowDropDown"

interface Props {
   open: boolean
   id: string
   anchorEl: HTMLElement
   handleClose: () => any
}

const UpIcon = (props: IconProps) => (
   // @ts-ignore
   <DownIcon {...props} style={{ transform: "rotate(180deg)" }} />
)

const styles: StylesProps = {
   paperRoot: {
      borderRadius: wishListBorderRadius,
      boxShadow: (theme) => theme.boxShadows.dark_12_13,
   },
   content: {
      p: 2,
      minWidth: 200,
      maxWidth: 500,
   },
   header: {},
   interestChip: {
      borderRadius: 1,
   },
}

export type SortType = "dateAsc" | "dateDesc" | "upvotesAsc" | "upvotesDesc"

export const getFirebaseSortType = (
   sortType: SortType
): [
   Wish["numberOfUpvotes"] | Wish["createdAt"],
   firebase.firestore.OrderByDirection
] => {
   switch (sortType) {
      case "dateAsc":
         // @ts-ignore
         return ["createdAt", "asc"]
      case "dateDesc":
         // @ts-ignore
         return ["createdAt", "desc"]
      case "upvotesAsc":
         // @ts-ignore
         return ["numberOfUpvotes", "asc"]
      case "upvotesDesc":
         // @ts-ignore
         return ["numberOfUpvotes", "desc"]
      default:
         // @ts-ignore
         return ["createdAt", "desc"]
   }
}

interface SelectProps {
   id: string
   labelId: string
   value: SortType
   label: string
   handleChange: (event: SelectChangeEvent<string>) => void
   options: { value: SortType; label: string; descending: boolean }[]
}

const FilterMenu = ({ id, open, anchorEl, handleClose }: Props) => {
   const { data: interests } = useInterests()
   const { pathname, push, query } = useRouter()
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
      [query.sortType]
   )

   const numberOfActiveFilters = useMemo(
      () => [query.interests, query.sortType].filter((value) => value).length,
      [query]
   )

   const handleQuery = (queryParam: string, queryValue: string | string[]) => {
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
   }

   const handleClickInterest = (interestName: string) => {
      const currentInterests = Array.isArray(query.interests)
         ? query.interests
         : query.interests?.split(",") || []
      const isInQuery = currentInterests.includes(interestName)
      const newQuery = {
         ...query,
         interests: isInQuery
            ? currentInterests
                 .filter((interest) => interest !== interestName)
                 .join(",")
            : currentInterests.concat(interestName).join(","),
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
   }

   const handleClearQueries = () => {
      void push({ pathname, query: {} }, undefined, { shallow: true })
   }
   const isSelected = useCallback(
      (interestId) => query.interests?.includes(interestId),
      [query.interests]
   )

   return (
      <Popover
         id={id}
         open={open}
         anchorEl={anchorEl}
         onClose={handleClose}
         anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
         }}
         transformOrigin={{
            vertical: "top",
            horizontal: "center",
         }}
         PaperProps={{ sx: styles.paperRoot }}
      >
         <Stack sx={styles.content} spacing={2}>
            {selects.map((select, index) => (
               <FormControl key={select.id} variant={"outlined"} fullWidth>
                  <Stack
                     direction={"row"}
                     justifyContent={"space-between"}
                     alignItems={"center"}
                     spacing={2}
                     sx={{ mb: 1 }}
                  >
                     <Typography
                        htmlFor={select.id}
                        component={"label"}
                        variant={"h6"}
                        id={select.labelId}
                     >
                        {select.label}
                     </Typography>
                     {index === 0 && !!numberOfActiveFilters && (
                        <Button
                           onClick={handleClearQueries}
                           variant={"text"}
                           size={"small"}
                           color={"secondary"}
                        >
                           Clear all ({numberOfActiveFilters})
                        </Button>
                     )}
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
            {interests.length > 0 && (
               <FormControl variant={"outlined"} fullWidth>
                  <Typography
                     htmlFor="tags-select"
                     component={"label"}
                     variant={"h6"}
                     id={"tags-select-label"}
                  >
                     {"Tags"}
                  </Typography>
                  <Box id={"tags-select"}>
                     {interests.map((interest) => (
                        <Chip
                           sx={styles.interestChip}
                           onClick={() => handleClickInterest(interest.id)}
                           color={
                              isSelected(interest.id) ? "primary" : "default"
                           }
                           /*
                           // @ts-ignore */
                           variant={
                              isSelected(interest.id) ? "contained" : "outlined"
                           }
                           stacked={"true"}
                           label={interest.name}
                           key={interest.id}
                        />
                     ))}
                  </Box>
               </FormControl>
            )}
         </Stack>
      </Popover>
   )
}

export default FilterMenu
