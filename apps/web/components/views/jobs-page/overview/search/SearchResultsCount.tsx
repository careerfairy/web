import { Stack } from "@mui/material"

import { Typography } from "@mui/material"
import { Frown } from "react-feather"
import { useJobsOverviewContext } from "../../JobsOverviewContext"

export const SearchResultsCount = () => {
   const { searchResultsCount, hasFilters } = useJobsOverviewContext()

   if (!hasFilters) return null

   return <Typography>{searchResultsCount} results</Typography>
}

export const NoResultsFound = () => {
   const { searchResultsCount, hasFilters, searchTerm } =
      useJobsOverviewContext()

   if (!hasFilters || searchResultsCount) return null

   return (
      <Stack alignItems="center" justifyContent="center">
         <Frown size={40} />
         <Typography>
            No jobs found{" "}
            {searchTerm ? (
               <Typography component="span">
                  for &quot;{searchTerm}&quot;
               </Typography>
            ) : (
               ""
            )}
         </Typography>
      </Stack>
   )
}
