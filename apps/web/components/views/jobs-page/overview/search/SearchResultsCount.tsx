import { Stack, useTheme } from "@mui/material"

import { Typography } from "@mui/material"
import { motion, Variants } from "framer-motion"
import { useEffect, useState } from "react"
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

const shakeVariants: Variants = {
   initial: { x: 0 },
   shake: {
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.3 },
   },
}

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
   const {
      searchResultsCount,
      hasFilters,
      searchTerm,
      searchJobTypes,
      searchLocations,
      searchBusinessFunctionTags,
   } = useJobsOverviewContext()
   const [animateShake, setAnimateShake] = useState(false)

   const shouldShow = hasFilters && !searchResultsCount

   useEffect(() => {
      if (shouldShow) {
         setAnimateShake(true)
         const timer = setTimeout(() => setAnimateShake(false), 300) // Duration of animation
         return () => clearTimeout(timer)
      }
   }, [
      searchResultsCount,
      searchTerm,
      shouldShow,
      searchJobTypes,
      searchLocations,
      searchBusinessFunctionTags,
   ])

   if (!shouldShow) return null

   return (
      <motion.div
         variants={shakeVariants}
         animate={animateShake ? "shake" : "initial"}
      >
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
      </motion.div>
   )
}
