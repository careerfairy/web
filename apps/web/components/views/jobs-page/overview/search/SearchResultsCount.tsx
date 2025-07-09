import { Stack, useTheme } from "@mui/material"

import { Typography } from "@mui/material"
import { Frown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useJobsOverviewContext } from "../../JobsOverviewContext"

const styles = sxStyles({
   resultsCount: {
      px: {
         xs: 2,
         sm: 2,
         md: 4,
      },
   },
   notFoundRoot: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      background: (theme) => theme.brand.white[100],
      p: "52px 12px",
   },
})

export const SearchResultsCount = () => {
   const { searchResultsCount, hasFilters } = useJobsOverviewContext()

   if (!hasFilters) return null

   return (
      <Typography
         variant="brandedBody"
         color="neutral.700"
         sx={styles.resultsCount}
      >
         {searchResultsCount} result{searchResultsCount !== 1 ? "s" : ""}
      </Typography>
   )
}

export const NoResultsFound = () => {
   const theme = useTheme()
   const { searchResultsCount, hasFilters, searchTerm } =
      useJobsOverviewContext()

   const shouldShow = hasFilters && !searchResultsCount

   if (!shouldShow) return null

   return (
      <Stack sx={styles.notFoundRoot} spacing={1}>
         <Frown size={40} color={theme.palette.neutral[600]} />
         <Typography
            variant="brandedBody"
            color="neutral.700"
            textAlign="center"
         >
            No jobs found {searchTerm ? "for" : ""}{" "}
            {searchTerm ? (
               <Typography
                  variant="brandedBody"
                  color="neutral.700"
                  fontWeight={600}
               >
                  &quot;{searchTerm}&quot;
               </Typography>
            ) : (
               ""
            )}
         </Typography>
      </Stack>
   )
}
