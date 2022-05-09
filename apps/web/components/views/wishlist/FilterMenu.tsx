import React, { useCallback, useMemo } from "react"
import {
   Button,
   Chip,
   FormControl,
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

interface Props {
   open: boolean
   id: string
   anchorEl: HTMLElement
   handleClose: () => any
}

const styles = {
   paperRoot: {
      borderRadius: wishListBorderRadius,
      boxShadow: "none",
      filter: (theme) => theme.customShadows.softShadow,
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

interface SelectProps {
   id: string
   labelId: string
   value: DateSort | UpvoteSort | InterestSort
   label: string
   handleChange: (event: SelectChangeEvent<string>) => void
   options: { value: DateSort | UpvoteSort | InterestSort; label: string }[]
}

export type DateSort = "newest" | "oldest"
export type UpvoteSort = "most" | "least"
export type InterestSort = string
const FilterMenu = ({ id, open, anchorEl, handleClose }: Props) => {
   const { data: interests } = useInterests()
   const { pathname, push, query } = useRouter()
   const selects = useMemo<SelectProps[]>(
      () => [
         {
            id: "date-select",
            labelId: "date-select-label",
            value: Array.isArray(query.date) ? query.date[0] : query.date,
            label: "Date",
            handleChange: (event) => {
               handleQuery("date", event.target.value)
            },
            options: [
               { value: "newest", label: "Newest" },
               { value: "oldest", label: "Oldest" },
            ],
         },
         {
            id: "upvote-select",
            labelId: "upvote-select-label",
            value: Array.isArray(query.upvote) ? query.upvote[0] : query.upvote,
            label: "Upvote",
            handleChange: (event) => {
               handleQuery("upvote", event.target.value)
            },
            options: [
               { value: "most", label: "Most" },
               { value: "least", label: "Least" },
            ],
         },
      ],
      [query.date, query.interests, query.upvote]
   )

   const handleQuery = (queryParam: string, queryValue: string | string[]) => {
      const newQuery = {
         ...query,
         [queryParam]: Array.isArray(queryValue)
            ? queryValue.join(",")
            : queryValue,
      }
      if (!queryValue) {
         delete newQuery[queryParam]
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
      (interestName) => query.interests?.includes(interestName),
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
               <FormControl variant={"outlined"} fullWidth>
                  <Stack
                     direction={"row"}
                     justifyContent={"space-between"}
                     alignItems={"center"}
                     spacing={2}
                     sx={{ mb: 1 }}
                     key={index}
                  >
                     <Typography
                        htmlFor={select.id}
                        component={"label"}
                        variant={"h6"}
                        id={select.labelId}
                     >
                        {select.label}
                     </Typography>
                     {index === 0 && (
                        <Button
                           onClick={handleClearQueries}
                           variant={"text"}
                           size={"small"}
                           color={"secondary"}
                        >
                           Clear all (3)
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
                           onClick={() => handleClickInterest(interest.name)}
                           color={
                              isSelected(interest.name) ? "primary" : "default"
                           }
                           /*
                           // @ts-ignore */
                           variant={
                              isSelected(interest.name)
                                 ? "contained"
                                 : "outlined"
                           }
                           stacked
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
