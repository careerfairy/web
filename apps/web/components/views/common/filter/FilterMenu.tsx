import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
   Button,
   Chip,
   FormControl,
   FormControlLabel,
   IconProps,
   Popover,
   SelectChangeEvent,
} from "@mui/material"
import Box from "@mui/material/Box"
import { wishListBorderRadius } from "../../../../constants/pages"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/router"
import { ResponsiveOption, ResponsiveSelect } from "../ResponsiveSelect"
import { useInterests } from "../../../custom-hook/useCollection"
import { StylesProps } from "../../../../types/commonTypes"
import firebase from "firebase/compat/app"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import DownIcon from "@mui/icons-material/ArrowDropDown"
import { languageOptionCodes } from "../../../../constants/forms"
import {
   formatToOptionArray,
   mapOptions,
   multiListSelectMapValueFn,
} from "../../signup/utils"
import MultiListSelect from "../MultiListSelect"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import Checkbox from "@mui/material/Checkbox"
import { FilterEnum } from "./Filter"

interface Props {
   open: boolean
   id: string
   anchorEl: HTMLElement
   handleClose: () => any
   filtersToShow: FilterEnum[]
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

const FilterMenu = ({
   id,
   open,
   anchorEl,
   handleClose,
   filtersToShow,
}: Props) => {
   const { data: interests } = useInterests()
   const [selectedLanguages, setSelectedOptions] = useState([] as OptionGroup[])
   const [selectedJobCheck, setSelectedJobCheck] = useState(false)
   const { pathname, push, query } = useRouter()

   useEffect(() => {
      const queryLanguages = query.languages as string
      const queryJobCheck = query.jobCheck

      if (queryLanguages) {
         const selectedOptions = formatToOptionArray(
            queryLanguages.split(","),
            languageOptionCodes
         )
         setSelectedOptions(selectedOptions)
      }

      if (queryJobCheck) {
         setSelectedJobCheck(queryJobCheck === "true")
      }
   }, [query.jobCheck, query.languages])

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

   const numberOfActiveFilters = useMemo(
      () => [query.interests, query.sortType].filter((value) => value).length,
      [query]
   )

   const handleClickInterest = useCallback(
      (interestName: string) => {
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
      },
      [pathname, push, query]
   )

   const handleChangeLanguages = useCallback(
      (name: string, selectedLanguages: OptionGroup[]) => {
         const languages = mapOptions(selectedLanguages)

         const newQuery = {
            ...query,
            [name]: languages.join(","),
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

   const handleJobCheck = useCallback(
      (event) => {
         const checked = event.target.checked

         const newQuery = {
            ...query,
            ["jobCheck"]: checked,
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

   const handleClearQueries = useCallback(() => {
      void push({ pathname, query: {} }, undefined, { shallow: true })
   }, [pathname, push])

   const isSelected = useCallback(
      (interestId) => query.interests?.includes(interestId),
      [query.interests]
   )

   const renderSortBy = useCallback((): JSX.Element => {
      return (
         <>
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
         </>
      )
   }, [handleClearQueries, numberOfActiveFilters, selects])

   const renderLanguages = useCallback(() => {
      return (
         <FormControl variant={"outlined"} fullWidth>
            <Typography
               htmlFor="language-select"
               component={"label"}
               variant={"h6"}
               id={"language-select-label"}
            >
               {"Languages"}
            </Typography>
            <Box id={"language-select"} mt={1}>
               <MultiListSelect
                  inputName={"languages"}
                  isCheckbox
                  selectedItems={selectedLanguages}
                  allValues={languageOptionCodes}
                  setFieldValue={handleChangeLanguages}
                  inputProps={{
                     placeholder: "Select languages",
                  }}
                  getValueFn={multiListSelectMapValueFn}
                  chipProps={{
                     color: "primary",
                  }}
               />
            </Box>
         </FormControl>
      )
   }, [handleChangeLanguages, selectedLanguages])

   const renderInterests = useCallback(() => {
      if (interests.length > 0) {
         return (
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
                        color={isSelected(interest.id) ? "primary" : "default"}
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
         )
      }
   }, [handleClickInterest, interests, isSelected])

   const renderJobCheck = useCallback(() => {
      return (
         <FormControlLabel
            control={
               <Checkbox
                  // @ts-ignore
                  size="large"
                  checked={selectedJobCheck}
                  onChange={handleJobCheck}
               />
            }
            label="Job opening available"
         />
      )
   }, [handleJobCheck, selectedJobCheck])

   const renderFilters = useCallback(
      (filter: FilterEnum): JSX.Element => {
         switch (filter) {
            case FilterEnum.interests:
               return renderInterests()

            case FilterEnum.languages:
               return renderLanguages()

            case FilterEnum.jobCheck:
               return renderJobCheck()

            case FilterEnum.sortBy:
               return renderSortBy()
         }
      },
      [renderInterests, renderJobCheck, renderLanguages, renderSortBy]
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
            {filtersToShow.map((filter) => renderFilters(filter))}
         </Stack>
      </Popover>
   )
}

export default FilterMenu
